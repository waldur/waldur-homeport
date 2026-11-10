import { describe, expect, it } from 'vitest';

import {
  formatDocumentTitle,
  getDocumentTitleBase,
  setDocumentTitle,
  setDocumentTitleUnread,
} from './documentTitle';

describe('documentTitle', () => {
  it('formats the prefix', () => {
    expect(formatDocumentTitle('Waldur | Projects', 0)).toBe(
      'Waldur | Projects',
    );
    expect(formatDocumentTitle('Waldur | Projects', 3)).toBe(
      '(3) Waldur | Projects',
    );
    expect(formatDocumentTitle('Waldur | Projects', 120)).toBe(
      '(99+) Waldur | Projects',
    );
  });

  it('keeps the unread prefix when the page title changes', () => {
    setDocumentTitle('Waldur | Projects');
    setDocumentTitleUnread(2);
    setDocumentTitle('Waldur | Resources');
    expect(document.title).toBe('(2) Waldur | Resources');
  });

  it('reads the page title without the unread prefix', () => {
    setDocumentTitle('Waldur | Projects');
    setDocumentTitleUnread(3);
    expect(getDocumentTitleBase()).toBe('Waldur | Projects');
  });

  it('clears the prefix at zero', () => {
    setDocumentTitle('Waldur | Projects');
    setDocumentTitleUnread(5);
    setDocumentTitleUnread(0);
    expect(document.title).toBe('Waldur | Projects');
  });
});
