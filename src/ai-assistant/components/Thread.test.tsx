import { afterEach, describe, expect, it } from 'vitest';

import { getThreadSuggestions } from '@/ai-assistant/components/Thread';
import { ENV } from '@/core/config';

const labels = () => getThreadSuggestions().map((item) => item.label);

describe('getThreadSuggestions', () => {
  afterEach(() => {
    delete ENV.plugins.WALDUR_CORE.DOCS_SEARCH_ENABLED;
  });

  it('offers to search the docs when the documentation search is on', () => {
    ENV.plugins.WALDUR_CORE.DOCS_SEARCH_ENABLED = true;
    expect(labels()).toContain('Search docs');
  });

  it('offers to search the docs when the backend does not report the setting', () => {
    expect(labels()).toContain('Search docs');
  });

  it('leaves the docs out when staff turned the documentation search off', () => {
    ENV.plugins.WALDUR_CORE.DOCS_SEARCH_ENABLED = false;
    expect(labels()).not.toContain('Search docs');
    expect(labels()).toContain('Create VM');
  });
});
