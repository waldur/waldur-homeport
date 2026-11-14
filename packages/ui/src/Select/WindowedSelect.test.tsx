import { render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

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

import { FormField } from '../Form';

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

// The portal props come from useSelect, like every other select's. Assert
// them here too: only the plain Select is covered end-to-end (by
// src/drawer/DrawerRoot.test.tsx, which clicks an option in a drawer).
describe('WindowedSelect — portaling defaults', () => {
  test('forwards the shared portal props to react-select', () => {
    baseSelectProps.length = 0;
    render(<WindowedSelect options={makeOptions(3)} />);
    const [
      { menuPortalTarget, menuPosition, menuPlacement, maxMenuHeight, styles },
    ] = baseSelectProps;
    expect(menuPortalTarget).toBe(document.body);
    expect(menuPosition).toBe('fixed');
    expect(menuPlacement).toBe('bottom');
    expect(maxMenuHeight).toBe(260);
    // `pointerEvents` keeps the menu clickable while a modal Radix Dialog
    // holds `pointer-events: none` on <body>.
    expect(styles.menuPortal({})).toEqual({
      zIndex: 9999,
      pointerEvents: 'auto',
    });
  });

  test('keeps the portal defaults when a caller passes its own styles', () => {
    baseSelectProps.length = 0;
    const menuList = (base: object) => ({ ...base, height: '175px' });
    render(<WindowedSelect options={makeOptions(3)} styles={{ menuList }} />);
    const [{ styles }] = baseSelectProps;
    expect(styles.menuList).toBe(menuList);
    expect(styles.menuPortal({})).toEqual({
      zIndex: 9999,
      pointerEvents: 'auto',
    });
  });
});

// Built on useSelect, so it behaves like the other selects in a form.
describe('WindowedSelect — shared select behaviour', () => {
  test('takes its input id from the enclosing field, so the label names it', () => {
    baseSelectProps.length = 0;
    render(
      <FormField controlId="country">
        <WindowedSelect options={makeOptions(3)} />
      </FormField>,
    );
    expect(baseSelectProps[0].inputId).toBe('country');
  });

  test("maps `disabled` to react-select's `isDisabled`", () => {
    baseSelectProps.length = 0;
    render(<WindowedSelect options={makeOptions(3)} disabled />);
    expect(baseSelectProps[0].isDisabled).toBe(true);
  });

  test('keeps picked options in an open multi-select menu', () => {
    baseSelectProps.length = 0;
    render(<WindowedSelect options={makeOptions(3)} isMulti />);
    expect(baseSelectProps[0].hideSelectedOptions).toBe(false);
    expect(baseSelectProps[0].closeMenuOnSelect).toBe(false);
  });

  test('takes only the look of `tableFilter`, not the filter behaviour', () => {
    baseSelectProps.length = 0;
    render(<WindowedSelect options={makeOptions(3)} variant="tableFilter" />);
    const [props] = baseSelectProps;
    expect(props.menuIsOpen).toBeUndefined();
    expect(props.autoFocus).toBeUndefined();
    expect(props.menuPortalTarget).toBe(document.body);
    expect(props.components.Control).toBeUndefined();
  });
});
