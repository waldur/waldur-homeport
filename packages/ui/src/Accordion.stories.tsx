import type { Meta, StoryObj } from '@storybook/react-vite';
import { CSSProperties, ReactNode, useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './Accordion';
import { Select } from './select';

const meta: Meta<typeof Accordion> = {
  title: 'Data Display/Accordion',
  component: Accordion,
  parameters: {
    docs: {
      description: {
        component:
          'Accordion (Accordion, AccordionItem, AccordionTrigger, AccordionContent) ported from the shadcn recipe on Radix Accordion. Real heading + button triggers, arrow-key navigation between headers, and the open header in the runtime brand colour. Closed panels unmount — use Collapsible with `keepMounted` for form fields. The filter stories mirror the mobile table filters sidebar: inline table-filter selects (auto-focused, open until blurred) and yes/no checkboxes.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Accordion>;

type Option = { value: string; label: string };

const toOptions = (labels: string[]): Option[] =>
  labels.map((label) => ({ value: label, label }));

const OFFERINGS = toOptions([
  'Private Clouds / Alpha Cloud',
  'AKKI / asd',
  'Private Clouds / Beta Cloud',
  'Private clouds / Focused stable process',
]);

const STATES = toOptions([
  'Creating',
  'OK',
  'Erred',
  'Updating',
  'Terminating',
]);

/**
 * An inline table-filter select, as SelectFilter renders it in the mobile
 * sidebar: focused and open when its panel expands, closed on blur, so only
 * one menu shows even with several panels open.
 */
const FilterSelect = ({
  options,
  placeholder,
  isMulti = false,
}: {
  options: Option[];
  placeholder: string;
  isMulti?: boolean;
}) => {
  const [value, setValue] = useState<Option | Option[] | null>(
    isMulti ? [] : null,
  );
  return (
    <Select
      variant="tableFilter"
      menuAlwaysOpen={false}
      options={options}
      placeholder={placeholder}
      isMulti={isMulti}
      value={value}
      onChange={setValue}
    />
  );
};

/** A yes/no filter, as BooleanFilter's checkbox renders it in the app. */
const FilterCheckbox = ({ label }: { label: string }) => (
  <label className="flex items-center gap-2 text-sm">
    <input type="checkbox" className="size-4" />
    {label}
  </label>
);

const FILTERS: { value: string; title: string; control: ReactNode }[] = [
  {
    value: 'offering',
    title: 'Offering',
    control: (
      <FilterSelect options={OFFERINGS} placeholder="Select offering..." />
    ),
  },
  {
    value: 'parent',
    title: 'Parent offering',
    control: (
      <FilterSelect options={OFFERINGS} placeholder="Select offering..." />
    ),
  },
  {
    value: 'state',
    title: 'State',
    control: (
      <FilterSelect options={STATES} placeholder="Select state..." isMulti />
    ),
  },
  {
    value: 'terminated',
    title: 'Include terminated',
    control: <FilterCheckbox label="Include terminated" />,
  },
  {
    value: 'paused',
    title: 'Paused',
    control: <FilterCheckbox label="Paused" />,
  },
];

/** The filters drawer's panel: a card-coloured column, no outer border. */
const FiltersFrame = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div className="max-w-sm bg-[var(--surface-card-bg)] p-4" style={style}>
    {children}
  </div>
);

const FilterItems = ({ disabled = [] }: { disabled?: string[] }) =>
  FILTERS.map((filter) => (
    <AccordionItem
      key={filter.value}
      value={filter.value}
      disabled={disabled.includes(filter.value)}
    >
      <AccordionTrigger>{filter.title}</AccordionTrigger>
      <AccordionContent>{filter.control}</AccordionContent>
    </AccordionItem>
  ));

/**
 * The mobile table filters sidebar: several panels open at once. Expanding
 * a select filter mounts it, focuses it and opens its menu inline; the
 * menu overflows the open panel and the field stays fully visible while
 * the panel slides open. Expanding another select closes the first one's
 * menu, so menus never pile up.
 */
export const FiltersSidebar: Story = {
  render: () => (
    <FiltersFrame>
      <Accordion type="multiple">
        <FilterItems />
      </Accordion>
    </FiltersFrame>
  ),
};

/**
 * One panel open at a time; opening another closes the first. Starts with
 * a yes/no filter open, so no select menu covers the list.
 */
export const Single: Story = {
  render: () => (
    <FiltersFrame>
      <Accordion type="single" collapsible defaultValue="terminated">
        <FilterItems />
      </Accordion>
    </FiltersFrame>
  ),
};

/**
 * A tenant with a non-default brand colour: the open header and its
 * chevron follow it. (`--color-brand-*` is overridden on the wrapper; the
 * app sets `--waldur-brand-*` on :root at load.)
 */
export const CustomBrand: Story = {
  render: () => (
    <FiltersFrame
      style={
        {
          '--color-brand-700': '#c11574',
          '--color-brand-200': '#fcceee',
        } as CSSProperties
      }
    >
      <Accordion type="multiple" defaultValue={['terminated']}>
        <FilterItems />
      </Accordion>
    </FiltersFrame>
  ),
};

/**
 * A disabled item can't be opened, and arrow keys skip it.
 */
export const DisabledItem: Story = {
  render: () => (
    <FiltersFrame>
      <Accordion type="multiple">
        <FilterItems disabled={['paused']} />
      </Accordion>
    </FiltersFrame>
  ),
};

const PERMISSION_GROUPS = [
  {
    value: 'project',
    title: 'Project',
    permissions: ['Create project', 'Update project', 'Delete project'],
  },
  {
    value: 'resource',
    title: 'Resource',
    permissions: ['Terminate resource', 'Set resource limits'],
  },
  {
    value: 'offering',
    title: 'Offering',
    permissions: ['Create offering', 'Update offering plans'],
  },
];

/**
 * Read-only grouped content, as in the role details dialog: a standalone
 * accordion adds its own outer border via `className`, since the component
 * draws only the separators between items.
 */
export const Boxed: Story = {
  render: () => (
    <div className="max-w-md bg-[var(--surface-page-bg)] p-6">
      <Accordion
        type="multiple"
        defaultValue={['project']}
        className="rounded-md border-[1px] border-solid border-[var(--surface-card-border)] bg-[var(--surface-card-bg)]"
      >
        {PERMISSION_GROUPS.map((group) => (
          <AccordionItem key={group.value} value={group.value}>
            <AccordionTrigger>{group.title}</AccordionTrigger>
            <AccordionContent>
              <ul className="m-0 list-disc ps-5">
                {group.permissions.map((permission) => (
                  <li key={permission}>{permission}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};
