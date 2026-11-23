import { describe, expect, it } from 'vitest';
import { NestedSection } from 'waldur-js-client';

import { getFilledSections, splitSections } from './offeringSections';

const section = (key: string, attrs: string[], isStandalone = false) =>
  ({
    key,
    title: key,
    is_standalone: isStandalone,
    attributes: attrs.map((attr) => ({
      uuid: attr,
      key: attr,
      title: attr,
      type: 'string',
      options: [],
    })),
  }) as NestedSection;

describe('getFilledSections', () => {
  it('keeps only attributes with a value and drops empty sections', () => {
    const result = getFilledSections(
      [section('support', ['email', 'phone']), section('access', ['api'])],
      { email: 'help@example.com', phone: '  ' },
    );
    expect(result.map((s) => s.key)).toEqual(['support']);
    expect(result[0].attributes.map((a) => a.key)).toEqual(['email']);
  });

  it('handles a category without sections', () => {
    expect(getFilledSections(undefined, { email: 'x' })).toEqual([]);
  });
});

describe('splitSections', () => {
  it('separates sections shown on a tab of their own', () => {
    const { grouped, standalone } = splitSections([
      section('support', ['email']),
      section('hardware', ['gpu'], true),
    ]);
    expect(grouped.map((s) => s.key)).toEqual(['support']);
    expect(standalone.map((s) => s.key)).toEqual(['hardware']);
  });
});
