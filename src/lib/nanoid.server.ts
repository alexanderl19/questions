import { customAlphabet } from 'nanoid';
import { nolookalikesSafe } from 'nanoid-dictionary';

export const nanoid = customAlphabet(nolookalikesSafe, 12);
