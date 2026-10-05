import { describe, expect, it } from 'vitest';

import { menuSurface } from './MenuContent';
import { menuItem } from './MenuItem';
import { menuLabel } from './MenuLabel';
import { menuSeparator } from './MenuSeparator';

// The class sets each menu look renders, sorted so that a refactor that only
// reorders classes still passes. These were measured against the original
// Metronic/Bootstrap menus; a change here is a visible change.
const classes = (value: string) => value.split(/\s+/).filter(Boolean).sort();

describe('menu looks', () => {
  it('keeps the nav panels', () => {
    expect(classes(menuSurface({ look: 'nav' }))).toMatchSnapshot();
    expect(
      classes(menuSurface({ look: 'nav', container: 'popover' })),
    ).toMatchSnapshot();
  });

  it('keeps the nav row, with its density and tone variants', () => {
    expect(classes(menuItem({ look: 'nav' }))).toMatchSnapshot();
  });

  it('keeps the action menu panel and rows', () => {
    expect(classes(menuSurface({ look: 'actions' }))).toMatchSnapshot();
    expect(classes(menuItem({ look: 'actions' }))).toMatchSnapshot();
    expect(classes(menuLabel({ look: 'actions' }))).toMatchSnapshot();
    expect(classes(menuSeparator({ look: 'actions' }))).toMatchSnapshot();
  });
});
