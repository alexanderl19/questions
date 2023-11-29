import { customAlphabet } from 'nanoid';
import nanoidDictionary from 'nanoid-dictionary';
const { nolookalikesSafe } = nanoidDictionary;

export const nanoid = customAlphabet(nolookalikesSafe, 12);
