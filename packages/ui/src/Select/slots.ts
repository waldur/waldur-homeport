import { ComponentType, createElement } from 'react';
import { components as defaultComponents } from 'react-select';

/**
 * The `data-slot` each react-select part carries: how stylesheets, parents
 * and tests find a part (see docs/class-names-and-data-attributes.md). The
 * input gets its slot from `SelectInput`, which has no `innerProps`.
 */
const SELECT_SLOTS = {
  SelectContainer: 'select',
  Control: 'select-control',
  Menu: 'select-menu',
  SingleValue: 'select-single-value',
  ClearIndicator: 'select-clear-indicator',
  Option: 'select-option',
} as const;

type SlottedPart = keyof typeof SELECT_SLOTS;

/** The component a slotted wrapper renders. */
const SLOT_TARGET = Symbol('selectSlotTarget');

// One wrapper per component and part: composeComponents runs on every render,
// and a new component type each time would remount the part.
const wrappers = new Map<SlottedPart, WeakMap<ComponentType<any>, any>>();

const withSlot = (part: SlottedPart, Component: ComponentType<any>) => {
  let cache = wrappers.get(part);
  if (!cache) {
    cache = new WeakMap();
    wrappers.set(part, cache);
  }
  let Wrapper = cache.get(Component);
  if (!Wrapper) {
    // react-select spreads `innerProps` onto each part's DOM element, and a
    // custom part passes them on to react-select's own component.
    Wrapper = (props: any) =>
      createElement(Component, {
        ...props,
        innerProps: { ...props.innerProps, 'data-slot': SELECT_SLOTS[part] },
      });
    Wrapper.displayName = `Slotted(${part})`;
    Wrapper[SLOT_TARGET] = Component;
    cache.set(Component, Wrapper);
  }
  return Wrapper;
};

/** Wraps each slotted part of `components`, react-select's own by default. */
export const withSelectSlots = (components: Record<string, any>) => {
  const result = { ...components };
  for (const part of Object.keys(SELECT_SLOTS) as SlottedPart[]) {
    result[part] = withSlot(part, components[part] ?? defaultComponents[part]);
  }
  return result;
};

/**
 * Whether the caller gave its own SingleValue, looking through the slot
 * wrapper (which is always there).
 */
export const hasCustomSingleValue = (components: Record<string, any>) => {
  const SingleValue = components?.SingleValue;
  if (!SingleValue) return false;
  const target = SingleValue[SLOT_TARGET] ?? SingleValue;
  return target !== defaultComponents.SingleValue;
};
