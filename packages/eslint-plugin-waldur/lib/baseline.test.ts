import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { REPO_ROOT } from './baseline.js';

// A rule only reports a stale count for a file it lints, so an entry for a
// deleted or renamed file would never be noticed.
describe.each([
  'hand-rolled-table.baseline.json',
  'typed-property.baseline.json',
])('%s', (file) => {
  it('lists only files that exist', () => {
    const entries = JSON.parse(
      readFileSync(path.join(REPO_ROOT, file), 'utf8'),
    );
    const missing = Object.keys(entries).filter(
      (key) => !existsSync(path.join(REPO_ROOT, key)),
    );
    expect(
      missing,
      `Run \`yarn lint:tables:baseline\` / \`yarn lint:properties:baseline\``,
    ).toEqual([]);
  });
});
