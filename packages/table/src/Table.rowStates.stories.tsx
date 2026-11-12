import Table from '@/table/Table';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form } from 'react-final-form';
import { expect, waitFor } from 'storybook/test';

import {
  tableStoryBaseProps,
  tableStoryRows,
  tableStoryWideColumns,
  TableStoryExpandableRow,
  TableStoryRow,
} from './storyFixtures';
import { withTableProviders } from './storyProviders';
import { RowVariant } from './types';

/**
 * The backgrounds and insets a row takes from its state: tinted
 * (`rowVariant`), selected in a form-field table (`fieldType`), expanded, and
 * the expanded content of a full-width table. Sibling of
 * `Table.rows.stories.tsx`.
 *
 * Every one of these is drawn through `--table-row-bg` or a fixed inset,
 * which a pixel comparison of the plain stories does not exercise, and a
 * selected row differs from a plain one by a colour step too small for its
 * threshold. So each play function asserts the computed values.
 */
const meta: Meta<typeof Table<TableStoryRow>> = {
  title: 'Data Display/Table/Row States',
  component: Table,
  decorators: [withTableProviders],
};
export default meta;

type Story = StoryObj<typeof Table<TableStoryRow>>;

const noop = () => undefined;

const STATUS_ROW_VARIANT: Record<
  TableStoryRow['status'],
  RowVariant | undefined
> = {
  OK: undefined,
  Creating: 'warning',
  Erred: 'danger',
};

const rowOf = (canvasElement: HTMLElement, name: string) => {
  const row = Array.from(
    canvasElement.querySelectorAll<HTMLTableRowElement>(
      'tr[data-slot="table-row"]',
    ),
  ).find((tr) => tr.textContent.includes(name));
  if (!row) throw new Error(`No row named ${name}`);
  return row;
};

const background = (element: Element) =>
  getComputedStyle(element).backgroundColor;

/** The colour a token resolves to in the story's theme. */
const tokenColor = (canvasElement: HTMLElement, token: string) => {
  const probe = document.createElement('span');
  probe.style.backgroundColor = `var(${token})`;
  canvasElement.appendChild(probe);
  const color = background(probe);
  probe.remove();
  return color;
};

const waitForRows = (canvasElement: HTMLElement) =>
  waitFor(() =>
    expect(
      canvasElement.querySelector('tr[data-slot="table-row"]'),
    ).not.toBeNull(),
  );

/** Rows tinted by their status (`rowVariant`): the erred row in the danger
 * tint, the one still being created in the warning tint, the rest plain. */
export const TintedRows: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      rowVariant={({ row }) => STATUS_ROW_VARIANT[row.status]}
    />
  ),
  play: async ({ canvasElement }) => {
    await waitForRows(canvasElement);
    await expect(background(rowOf(canvasElement, 'analytics-pipeline'))).toBe(
      tokenColor(canvasElement, '--status-danger-bg'),
    );
    await expect(background(rowOf(canvasElement, 'staging-cluster'))).toBe(
      tokenColor(canvasElement, '--status-warning-bg'),
    );
    await expect(background(rowOf(canvasElement, 'production-cluster'))).toBe(
      tokenColor(canvasElement, '--bg-primary'),
    );
  },
};

/** A pinned cell paints its own background to cover what scrolls under it,
 * so in a tinted row it must take the row's tint, not the plain surface. */
export const TintedRowsWithPinnedColumn: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      columns={tableStoryWideColumns}
      pinnedColumnKeys={['name']}
      rowVariant={({ row }) => STATUS_ROW_VARIANT[row.status]}
    />
  ),
  play: async ({ canvasElement }) => {
    await waitForRows(canvasElement);
    const erred = rowOf(canvasElement, 'analytics-pipeline');
    await expect(background(erred.cells[0])).toBe(background(erred));
    await expect(background(erred)).toBe(
      tokenColor(canvasElement, '--status-danger-bg'),
    );
  },
};

/** A form-field table (`fieldType="radio"`): the row picked in the form is
 * marked `data-state="selected"` and takes the secondary surface. */
export const SelectedRadioRow: Story = {
  render: () => (
    <Form
      onSubmit={noop}
      initialValues={{ cluster: tableStoryRows[1] }}
      render={() => (
        <Table {...tableStoryBaseProps} fieldType="radio" fieldName="cluster" />
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    await waitForRows(canvasElement);
    const selected = rowOf(canvasElement, tableStoryRows[1].name);
    const plain = rowOf(canvasElement, tableStoryRows[0].name);
    await expect(selected).toHaveAttribute('data-state', 'selected');
    await expect(background(selected)).toBe(
      tokenColor(canvasElement, '--bg-secondary'),
    );
    await expect(plain).not.toHaveAttribute('data-state');
    await expect(background(plain)).toBe(
      tokenColor(canvasElement, '--bg-primary'),
    );
  },
};

/** The same with checkboxes (`fieldType="checkbox"`): two rows picked. */
export const SelectedCheckboxRows: Story = {
  render: () => (
    <Form
      onSubmit={noop}
      initialValues={{ clusters: [tableStoryRows[0], tableStoryRows[2]] }}
      render={() => (
        <Table
          {...tableStoryBaseProps}
          fieldType="checkbox"
          fieldName="clusters"
        />
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    await waitForRows(canvasElement);
    const secondary = tokenColor(canvasElement, '--bg-secondary');
    for (const row of [tableStoryRows[0], tableStoryRows[2]]) {
      await expect(background(rowOf(canvasElement, row.name))).toBe(secondary);
    }
    await expect(
      background(rowOf(canvasElement, tableStoryRows[1].name)),
    ).not.toBe(secondary);
  },
};

/** A selected row wins over its tint, as an expanded one does. */
export const SelectedTintedRow: Story = {
  render: () => (
    <Form
      onSubmit={noop}
      initialValues={{ cluster: tableStoryRows[2] }}
      render={() => (
        <Table
          {...tableStoryBaseProps}
          fieldType="radio"
          fieldName="cluster"
          rowVariant={({ row }) => STATUS_ROW_VARIANT[row.status]}
        />
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    await waitForRows(canvasElement);
    await expect(background(rowOf(canvasElement, 'analytics-pipeline'))).toBe(
      tokenColor(canvasElement, '--bg-secondary'),
    );
    await expect(background(rowOf(canvasElement, 'staging-cluster'))).toBe(
      tokenColor(canvasElement, '--status-warning-bg'),
    );
  },
};

/** An expanded row and its details share the secondary surface, and the row
 * is marked `data-state="expanded"`; `aria-expanded` stays on the expander
 * button, since it is not allowed on a table row. */
export const ExpandedRowBackground: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      toggled={{ [tableStoryRows[0].uuid]: true }}
      expandableRow={({ row }) => <TableStoryExpandableRow row={row} />}
    />
  ),
  play: async ({ canvasElement }) => {
    await waitForRows(canvasElement);
    const expanded = rowOf(canvasElement, tableStoryRows[0].name);
    const secondary = tokenColor(canvasElement, '--bg-secondary');
    await expect(expanded).toHaveAttribute('data-state', 'expanded');
    await expect(expanded).not.toHaveAttribute('aria-expanded');
    await expect(background(expanded)).toBe(secondary);
    await expect(background(expanded.nextElementSibling)).toBe(secondary);
    await expect(
      expanded.querySelector('[data-testid="row-expander"]'),
    ).toHaveAttribute('aria-expanded', 'true');
  },
};

const expandedContentInset = (canvasElement: HTMLElement) =>
  getComputedStyle(
    canvasElement.querySelector('[data-slot="expanded-row-content"]'),
  ).paddingLeft;

/** A full-width table (`fullWidth`, what most pages use): its rows start at
 * the card's edge, and the expanded content is inset 28px. */
export const FullWidthExpandedRow: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      fullWidth
      toggled={{ [tableStoryRows[0].uuid]: true }}
      expandableRow={({ row }) => <TableStoryExpandableRow row={row} />}
    />
  ),
  play: async ({ canvasElement }) => {
    await waitForRows(canvasElement);
    await expect(expandedContentInset(canvasElement)).toBe('28px');
  },
};

/** The same with a selection column, which moves the content to 60px. */
export const FullWidthExpandedRowWithMultiSelect: Story = {
  render: () => (
    <Table
      {...tableStoryBaseProps}
      fullWidth
      enableMultiSelect
      selectedRows={[]}
      toggled={{ [tableStoryRows[0].uuid]: true }}
      expandableRow={({ row }) => <TableStoryExpandableRow row={row} />}
    />
  ),
  play: async ({ canvasElement }) => {
    await waitForRows(canvasElement);
    await expect(expandedContentInset(canvasElement)).toBe('60px');
  },
};
