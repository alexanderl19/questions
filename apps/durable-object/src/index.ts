import { Hono } from "hono";
export { Game } from "./game";

type Bindings = {
  GAME: DurableObjectNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("*", async (c) => {
  const id = c.env.GAME.idFromName("A");
  const obj = c.env.GAME.get(id);
  const resp = await obj.fetch(c.req.url);

  if (resp.status === 404) {
    return c.text("404 Not Found", 404);
  }

  const count = parseInt(await resp.text());
  return c.text(`Count is ${count}`);
});

export default app;
