import { render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('./theme', () => ({
  useSelectTheme: () => undefined,
}));
vi.mock('./SelectHelper', () => ({
  composeComponents: (components: object | undefined) => components ?? {},
}));

// Capture the components prop react-select receives so we can assert the
// virtualizer is only injected past the windowing threshold.
const baseSelectProps: any[] = [];
vi.mock('react-select', () => ({
  __esModule: true,
  default: (props: any) => {
    baseSelectProps.push(props);
    return <div data-testid="base-select" />;
  },
}));

vi.mock('./VirtualMenuList', () => {
  const MenuListStub = () => null;
  MenuListStub.displayName = 'VirtualMenuListStub';
  return { VirtualMenuList: MenuListStub };
});

import { VirtualMenuList } from './VirtualMenuList';
import { WindowedSelect } from './WindowedSelect';

const makeOptions = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ value: i, label: `opt-${i}` }));

describe('WindowedSelect — windowing threshold', () => {
  test('does NOT inject VirtualMenuList for short lists', () => {
    baseSelectProps.length = 0;
    render(<WindowedSelect options={makeOptions(10)} />);
    expect(baseSelectProps).toHaveLength(1);
    expect(baseSelectProps[0].components.MenuList).toBeUndefined();
  });

  test('injects VirtualMenuList once options.length >= windowThreshold (100)', () => {
    baseSelectProps.length = 0;
    render(<WindowedSelect options={makeOptions(120)} />);
    expect(baseSelectProps).toHaveLength(1);
    expect(baseSelectProps[0].components.MenuList).toBe(VirtualMenuList);
  });

  test('respects a custom windowThreshold prop', () => {
    baseSelectProps.length = 0;
    render(<WindowedSelect options={makeOptions(10)} windowThreshold={5} />);
    expect(baseSelectProps[0].components.MenuList).toBe(VirtualMenuList);
  });

  test('counts grouped options across all groups for the threshold', () => {
    baseSelectProps.length = 0;
    const grouped = [
      { label: 'A', options: makeOptions(60) },
      { label: 'B', options: makeOptions(60) },
    ];
    render(<WindowedSelect options={grouped} />);
    expect(baseSelectProps[0].components.MenuList).toBe(VirtualMenuList);
  });
});
