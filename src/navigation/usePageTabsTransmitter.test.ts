import { renderHook } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { describe, expect, it, vi } from 'vitest';

import { PageBarTab } from './types';
import { usePageTabsTransmitter } from './usePageTabsTransmitter';

vi.mock('./context', () => ({ useExtraTabs: vi.fn() }));

const Details = () => null;
const Reviewer = () => null;
const Components = () => null;

const openPage = (tabs: PageBarTab[], params: Record<string, any> = {}) => {
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name: 'profile-manage' },
    params,
  } as any);
  return renderHook(() => usePageTabsTransmitter(tabs)).result.current.tabSpec
    ?.key;
};

const details = { key: 'details', title: 'Details', component: Details };
const reviewer = { key: 'reviewer', title: 'Reviewer', component: Reviewer };
// A parent shown in the tab bar whose only child is hidden: it is reached by
// `defaultKey`, never by falling back.
const accounting: PageBarTab = {
  key: 'accounting',
  title: 'Accounting',
  defaultKey: 'components',
  children: [
    {
      key: 'components',
      title: 'Components',
      component: Components,
      visible: false,
    },
  ],
};

describe('usePageTabsTransmitter', () => {
  it('renders the first tab when the URL names none', () => {
    expect(openPage([details, reviewer])).toBe('details');
  });

  it('renders the tab the URL names', () => {
    expect(openPage([details, reviewer], { tab: 'reviewer' })).toBe('reviewer');
  });

  // The tab bar does not show a hidden tab, so falling back to it would
  // render content no tab is highlighted for.
  it('falls back past a hidden tab', () => {
    expect(openPage([{ ...details, visible: false }, reviewer])).toBe(
      'reviewer',
    );
  });

  it('falls back past a parent whose children are all hidden', () => {
    expect(openPage([accounting, reviewer])).toBe('reviewer');
  });

  it('falls back to the first shown tab for an unknown ?tab=', () => {
    expect(
      openPage([{ ...details, visible: false }, reviewer], { tab: 'bogus' }),
    ).toBe('reviewer');
  });

  it('still opens a hidden tab by its key', () => {
    expect(openPage([accounting, reviewer], { tab: 'components' })).toBe(
      'components',
    );
  });
});
