/**
 * synckit worker: lets the synchronous ESLint rule ask the async oracle.
 * Takes the file's class tokens, answers with the unknown ones and a
 * suggestion for each.
 */

import { runAsWorker } from 'synckit';

import { loadOracle, suggest } from './class-oracle.js';

runAsWorker(async ({ root, entryPoint, tokens }) => {
  const oracle = await loadOracle(root, entryPoint);
  return oracle
    .unknown(tokens)
    .map((token) => ({ token, suggestion: suggest(oracle, token) }));
});
