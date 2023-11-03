import { createIsDebug } from './createIsDebug';

export const isDebug = createIsDebug(process.env.DEBUG || '');
