import { describe, expect, it } from 'vitest';

import { toTemplateDocument } from './templateDocument';

describe('toTemplateDocument', () => {
  it('leaves out the sections that belong to one call', () => {
    const { document, dropped } = toTemplateDocument({
      schema_version: 3,
      call: { name: 'Spring call' },
      rounds: [{ start_time: '2026-01-01T00:00:00+00:00' }],
      requested_offerings: [{ offering: { name: 'GPU' } }],
      documents: [],
      workflow_steps: [{ name: 'Review' }],
    });
    expect(document).toEqual({
      schema_version: 3,
      call: { name: 'Spring call' },
      workflow_steps: [{ name: 'Review' }],
    });
    // An empty section is left out without a word.
    expect(dropped).toEqual(['rounds', 'requested offerings']);
  });

  it('keeps a document without them as it is', () => {
    const data = { schema_version: 3, call: { name: 'Spring call' } };
    expect(toTemplateDocument(data)).toEqual({ document: data, dropped: [] });
  });
});
