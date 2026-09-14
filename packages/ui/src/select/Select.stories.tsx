import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { AsyncSelect } from './AsyncSelect';
import { CreatableSelect } from './CreatableSelect';
import { Select } from './Select';

// Same sample data used to verify this component live against the
// pre-migration deployment (see waldur-homeport's Resources list filters):
// resource states for the multi-select cases, organizations for single-select.
const STATE_OPTIONS = [
  { value: 'creating', label: 'Creating' },
  { value: 'ok', label: 'OK' },
  { value: 'erred', label: 'Erred' },
  { value: 'updating', label: 'Updating' },
];

const ORG_OPTIONS = [
  { value: 'abc', label: 'abc' },
  { value: 'service-provider', label: 'service provider' },
];

const meta: Meta<typeof Select> = {
  title: 'Primitives/Select',
  component: Select,
  argTypes: {
    size: { control: 'select', options: [undefined, 'sm'] },
    variant: {
      control: 'select',
      options: [undefined, 'tableFilter', 'tableCell'],
    },
    isDisabled: { control: 'boolean' },
    isMulti: { control: 'boolean' },
  },
  args: {
    options: ORG_OPTIONS,
    placeholder: 'Select an organization...',
  },
  parameters: {
    docs: {
      description: {
        component:
          "React-select wrapped in Waldur's Tailwind design tokens instead of react-select's own emotion styles (`unstyled: true` + a `classNames` config in tailwindStyles.ts). Every value here — border color/radius, control height, menu shadow, checkbox styling, placeholder color — was pinned by computed-style diffing against the live pre-migration (Bootstrap/SCSS) select, not eyeballed, since react-select ships several properties (`minHeight`, `fontSize: inherit`, `display: block` on Option) *unconditionally*, outside its own `unstyled` branch, as unlayered emotion CSS that silently beats a normal-priority Tailwind utility — those spots need the `!` important modifier and are commented inline in tailwindStyles.ts. Dark mode is a real second theme, not a filter: toggle it with the theme control in the toolbar above.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Playground: Story = {};

/**
 * `size="sm"` (28px) next to the default control height (40px, matched
 * live against the pre-migration control).
 */
export const Sizes: Story = {
  render: () => (
    <div className="p-6 bg-[var(--surface-page-bg)] flex items-end gap-6">
      <div className="w-64">
        <div className="text-xs uppercase font-mono text-[var(--surface-text-muted)] mb-2">
          Default
        </div>
        <Select options={ORG_OPTIONS} placeholder="Select an organization..." />
      </div>
      <div className="w-64">
        <div className="text-xs uppercase font-mono text-[var(--surface-text-muted)] mb-2">
          size=&quot;sm&quot;
        </div>
        <Select
          size="sm"
          options={ORG_OPTIONS}
          placeholder="Select an organization..."
        />
      </div>
    </div>
  ),
};

/**
 * Default (unfocused), focused, disabled and error side by side. Focused
 * uses `autoFocus` rather than a click so the ring/border renders without
 * any Canvas interaction. Error is driven by `meta` — the same
 * `touched && error` shape a react-final-form `Field` passes — not a
 * dedicated `hasError` prop.
 */
export const ControlStates: Story = {
  render: () => (
    <div className="p-6 bg-[var(--surface-page-bg)] flex items-start gap-6">
      <div className="w-64">
        <div className="text-xs uppercase font-mono text-[var(--surface-text-muted)] mb-2">
          Default
        </div>
        <Select options={ORG_OPTIONS} placeholder="Select an organization..." />
      </div>
      <div className="w-64">
        <div className="text-xs uppercase font-mono text-[var(--surface-text-muted)] mb-2">
          Focused
        </div>
        <Select
          autoFocus
          options={ORG_OPTIONS}
          placeholder="Select an organization..."
        />
      </div>
      <div className="w-64">
        <div className="text-xs uppercase font-mono text-[var(--surface-text-muted)] mb-2">
          Disabled
        </div>
        <Select
          isDisabled
          options={ORG_OPTIONS}
          placeholder="Select an organization..."
        />
      </div>
      <div className="w-64">
        <div className="text-xs uppercase font-mono text-[var(--surface-text-muted)] mb-2">
          Error
        </div>
        <Select
          options={ORG_OPTIONS}
          placeholder="Select an organization..."
          meta={{ touched: true, error: 'Organization is required' }}
        />
      </div>
    </div>
  ),
};

/**
 * Single-select's selected row draws a checkmark via a `::after`
 * pseudo-element (reusing `--checkbox-bg`, the same SVG the app's native
 * checkboxes use); multi-select renders its own checkbox per row instead
 * (`MultiSelectOption` in components.tsx) and skips the checkmark. Both
 * open with `menuIsOpen` — react-select treats that prop as making the menu
 * *fully* controlled, so `onMenuOpen`/`onMenuClose` no-ops have to come
 * along with it or the initial open render is silently dropped. The default
 * `menuPortalTarget: document.body` (see `defaultPortalingProps` in
 * useSelect.ts) also has to be turned off here — react-select reports
 * `aria-expanded="true"` correctly either way, but the portaled menu never
 * actually paints inside Storybook's preview iframe, so these render the
 * menu inline instead, the same way `variant="tableFilter"` already does.
 */
export const SingleVsMultiOptions: Story = {
  render: () => (
    <div className="p-6 bg-[var(--surface-page-bg)] flex items-start gap-6">
      <div className="w-64">
        <div className="text-xs uppercase font-mono text-[var(--surface-text-muted)] mb-2">
          Single-select (checkmark)
        </div>
        <Select
          menuIsOpen
          menuPortalTarget={undefined}
          menuPosition={undefined}
          menuPlacement={undefined}
          onMenuOpen={() => {}}
          onMenuClose={() => {}}
          options={ORG_OPTIONS}
          value={ORG_OPTIONS[0]}
          placeholder="Select an organization..."
        />
      </div>
      <div className="w-64">
        <div className="text-xs uppercase font-mono text-[var(--surface-text-muted)] mb-2">
          Multi-select (checkboxes)
        </div>
        <Select
          isMulti
          menuIsOpen
          menuPortalTarget={undefined}
          menuPosition={undefined}
          menuPlacement={undefined}
          onMenuOpen={() => {}}
          onMenuClose={() => {}}
          options={STATE_OPTIONS}
          value={[STATE_OPTIONS[0]]}
          placeholder="Select..."
        />
      </div>
    </div>
  ),
};

/**
 * `variant="tableFilter"` — the style used by every field in the Resources
 * list's "Add filter" panel (`src/table/filters.tsx`'s `SelectFilter`/
 * `AsyncSelectFilter`). `FilterSelectControl` prepends a search icon,
 * conditionally: it hides once a single-select has a value (the second
 * example below) since the selected value takes the icon's place — this is
 * `FilterSelectControl`'s own designed behavior, not the same thing as
 * `OfferingFilter`'s never-shows-the-icon case, which comes from that
 * caller's own value normalization making `hasValue` true before any
 * selection (see `useNormalizeSelectFilterValue`), not from this component.
 */
export const TableFilterVariant: Story = {
  render: () => (
    <div className="p-6 bg-[var(--surface-page-bg)] flex items-start gap-6">
      <div className="w-72">
        <div className="text-xs uppercase font-mono text-[var(--surface-text-muted)] mb-2">
          Empty (icon shown)
        </div>
        <Select
          variant="tableFilter"
          menuIsOpen
          isMulti
          options={STATE_OPTIONS}
          placeholder="Select..."
        />
      </div>
      <div className="w-72">
        <div className="text-xs uppercase font-mono text-[var(--surface-text-muted)] mb-2">
          Has a value (icon hidden)
        </div>
        <Select
          variant="tableFilter"
          options={ORG_OPTIONS}
          value={ORG_OPTIONS[0]}
        />
      </div>
    </div>
  ),
};

/**
 * `variant="tableCell"` — a shorter control (35px vs. the default 40px) for
 * selects embedded directly in a table row, where the default height would
 * blow out the row (see K8sSecurityRulesField.tsx's protocol/direction
 * columns).
 */
export const TableCellVariant: Story = {
  render: () => (
    <table className="m-6 border-collapse">
      <thead>
        <tr className="text-xs uppercase font-mono text-[var(--surface-text-muted)] text-left">
          <th className="pb-2 pr-4">Protocol</th>
          <th className="pb-2">Direction</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="pr-4 w-32">
            <Select
              variant="tableCell"
              simpleValue
              options={[
                { value: 'TCP', label: 'TCP' },
                { value: 'UDP', label: 'UDP' },
              ]}
              value={{ value: 'TCP', label: 'TCP' }}
            />
          </td>
          <td className="w-32">
            <Select
              variant="tableCell"
              simpleValue
              options={[
                { value: 'ingress', label: 'Ingress' },
                { value: 'egress', label: 'Egress' },
              ]}
              value={{ value: 'ingress', label: 'Ingress' }}
            />
          </td>
        </tr>
      </tbody>
    </table>
  ),
};

/**
 * `AsyncSelect` — options load from a (simulated) server call as the user
 * types. `defaultOptions` shows an initial page before any input.
 */
export const Async: Story = {
  render: () => {
    const loadOptions = async (inputValue: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const options = ORG_OPTIONS.filter((o) =>
        o.label.toLowerCase().includes(inputValue.toLowerCase()),
      );
      return { options, hasMore: false };
    };
    return (
      <div className="p-6 bg-[var(--surface-page-bg)] w-64">
        {/* `defaultOptions={true}`, not a literal array: that asks
            react-select-async-paginate to fetch the first page itself via
            `loadOptions('')` on mount/open — passing the same array as a
            *seed* here as well double-appends it as a second page. */}
        <AsyncSelect
          defaultOptions
          loadOptions={loadOptions}
          placeholder="Search an organization..."
        />
      </div>
    );
  },
};

/**
 * `CreatableSelect` — same styling, with the option to type a value that
 * doesn't exist yet and add it as a new option.
 */
export const Creatable: Story = {
  render: () => {
    const [options, setOptions] = useState(STATE_OPTIONS);
    const [value, setValue] = useState<(typeof STATE_OPTIONS)[number] | null>(
      null,
    );
    return (
      <div className="p-6 bg-[var(--surface-page-bg)] w-64">
        <CreatableSelect
          options={options}
          value={value}
          onChange={(next: any) => setValue(next)}
          onCreateOption={(label: string) => {
            const created = { value: label, label };
            setOptions([...options, created]);
            setValue(created);
          }}
        />
      </div>
    );
  },
};
