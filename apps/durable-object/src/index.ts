import { Hono } from "hono";
export { Game } from "./game";

import { customAlphabet } from "nanoid";
import { nolookalikesSafe } from "nanoid-dictionary";
const nanoid = customAlphabet(nolookalikesSafe, 6);

type Bindings = {
  GAME: DurableObjectNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/new", async (c) => {
  const id = nanoid();
  return c.json({ id });
});

app.get("/:id/*", async (c) => {
  const id = c.env.GAME.idFromName(c.req.param("id"));
  const obj = c.env.GAME.get(id);
  const resp = await obj.fetch(c.req.raw);

  if (resp.status === 404) {
    return c.text("404 Not Found", 404);
  }

  return resp;
});

export default app;
