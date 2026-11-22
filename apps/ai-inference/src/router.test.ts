import { describe, expect, it } from 'vitest';

import { parsePath, sectionHref } from './router';

describe('router', () => {
  it('shows the first project on the root', () => {
    expect(parsePath('')).toEqual({ section: 'overview' });
    expect(parsePath('elsewhere/')).toEqual({ section: 'overview' });
  });

  it('reads the project and the section', () => {
    expect(parsePath('projects/p1/')).toEqual({
      projectUuid: 'p1',
      section: 'overview',
    });
    expect(parsePath('projects/p1/keys/')).toEqual({
      projectUuid: 'p1',
      section: 'keys',
    });
    expect(parsePath('projects/p1/nonsense/')).toEqual({
      projectUuid: 'p1',
      section: 'overview',
    });
  });

  it('builds the path it reads', () => {
    for (const section of [
      'overview',
      'models',
      'keys',
      'usage',
      'add',
    ] as const) {
      const href = sectionHref('p1', section);
      expect(parsePath(href.replace(/^\//, ''))).toEqual({
        projectUuid: 'p1',
        section,
      });
    }
  });
});
