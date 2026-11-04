/**
 * Shared machinery for rules with a shrinking per-file baseline
 * (prefer-typed-property, no-hand-rolled-table): a JSON file at the
 * repository root maps a repo-relative path to what that file may still hold.
 * scripts/lib/rule-baseline.mjs writes these files.
 */

import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);

/** The linted file's path relative to the repository, with `/` separators. */
export const repoRelative = (filename) =>
  path.relative(REPO_ROOT, filename).split(path.sep).join('/');

/**
 * A reader for one baseline file, re-read only when it changes on disk. A
 * missing or unreadable file reads as empty.
 */
export const createBaselineReader = () => {
  let cache = { file: null, mtimeMs: -1, entries: {} };
  return (file) => {
    try {
      const { mtimeMs } = statSync(file);
      if (file !== cache.file || mtimeMs !== cache.mtimeMs) {
        cache = {
          file,
          mtimeMs,
          entries: JSON.parse(readFileSync(file, 'utf8')),
        };
      }
    } catch {
      cache = { file, mtimeMs: -1, entries: {} };
    }
    return cache.entries;
  };
};
