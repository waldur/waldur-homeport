import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Card, CardContent, CardHeader, CardTitle } from 'waldur-ui';

import {
  tableStoryBaseProps,
  tableStoryRows,
  TableStoryExpandableRow,
} from '@/table/storyFixtures';
import { withTableProviders } from '@/table/storyProviders';
import Table from '@/table/Table';

import { PROPOSAL_FLUSH_TABLE_CLASS } from './flushTable';

/**
 * `PROPOSAL_FLUSH_TABLE_CLASS`: a table nested in a section card of the
 * proposal page. The section already supplies the frame and the inset, so the
 * class strips the table card's own, moves the edge spacing to the cells and
 * closes the table with a rule. The play functions assert those values: the
 * class is a list of arbitrary selectors, and one that stops matching changes
 * nothing a unit test or the linter can see.
 */
const meta: Meta = {
  title: 'Proposals/Flush Table',
  decorators: [withTableProviders],
};
export default meta;

type Story = StoryObj;

const Section = ({ children }: { children: React.ReactNode }) => (
  <div className="w-[720px]">
    <Card bordered>
      <CardHeader>
        <CardTitle>Team</CardTitle>
      </CardHeader>
      <CardContent data-testid="section-body">{children}</CardContent>
    </Card>
  </div>
);

const px = (element: Element, property: string) =>
  getComputedStyle(element).getPropertyValue(property);

const waitForTable = (canvasElement: HTMLElement) =>
  waitFor(() =>
    expect(
      canvasElement.querySelector('tr[data-slot="table-row"]'),
    ).not.toBeNull(),
  );

const expectFlush = async (
  canvasElement: HTMLElement,
  { expandable = false } = {},
) => {
  const tableCard = canvasElement.querySelector(
    '[data-slot="card"][data-variant="table"]',
  );
  const tableBody = tableCard.querySelector(
    ':scope > [data-slot="card-content"]',
  );
  // The table card's own horizontal inset is gone…
  await expect(px(tableBody, 'padding-left')).toBe('0px');
  await expect(px(tableBody, 'padding-right')).toBe('0px');
  // …and, with no pagination bar, so is the bottom one.
  await expect(px(tableBody, 'padding-bottom')).toBe('0px');
  // The cells carry the edge spacing instead.
  // The cells carry the edge spacing instead. An expandable table's first
  // cell has no padding of its own: its expander wrapper sets the inset.
  const headerCells = canvasElement.querySelectorAll('thead th');
  await expect(px(headerCells[0], 'padding-left')).toBe(
    expandable ? '0px' : '16.25px',
  );
  await expect(px(headerCells[headerCells.length - 1], 'padding-right')).toBe(
    '16.25px',
  );
  // The table closes with a rule of its own.
  const scroller = canvasElement.querySelector(
    '[data-slot="table-responsive"]',
  );
  await expect(px(scroller, 'border-bottom-width')).toBe('1px');
  await expect(px(scroller, 'border-bottom-style')).toBe('solid');
};

/** The class on a wrapper that opens the section body: the body drops its
 * top inset, so the header band sits against the section's rule. */
export const OpensTheSectionBody: Story = {
  render: () => (
    <Section>
      <div className={PROPOSAL_FLUSH_TABLE_CLASS}>
        <Table
          {...tableStoryBaseProps}
          hasActionBar={false}
          cardBordered={false}
          minHeight="auto"
          hasPagination={false}
          hideTitle
        />
      </div>
    </Section>
  ),
  play: async ({ canvasElement }) => {
    await waitForTable(canvasElement);
    await expectFlush(canvasElement);
    await expect(
      px(
        canvasElement.querySelector('[data-testid="section-body"]'),
        'padding-top',
      ),
    ).toBe('0px');
  },
};

/** The class on the table's own card, below other content: the section body
 * keeps its top inset, since the table no longer opens it. */
export const BelowOtherContent: Story = {
  render: () => (
    <Section>
      <p className="mb-3 text-quaternary">
        People who can edit and submit this proposal.
      </p>
      <Table
        {...tableStoryBaseProps}
        className={PROPOSAL_FLUSH_TABLE_CLASS}
        hasActionBar={false}
        cardBordered={false}
        minHeight="auto"
        hasPagination={false}
        hideTitle
      />
    </Section>
  ),
  play: async ({ canvasElement }) => {
    await waitForTable(canvasElement);
    await expectFlush(canvasElement);
    await expect(
      px(
        canvasElement.querySelector('[data-testid="section-body"]'),
        'padding-top',
      ),
    ).not.toBe('0px');
  },
};

/** With an expanded row: the details keep their own inset. */
export const WithExpandedRow: Story = {
  render: () => (
    <Section>
      <div className={PROPOSAL_FLUSH_TABLE_CLASS}>
        <Table
          {...tableStoryBaseProps}
          hasActionBar={false}
          cardBordered={false}
          minHeight="auto"
          hasPagination={false}
          hideTitle
          toggled={{ [tableStoryRows[0].uuid]: true }}
          expandableRow={({ row }) => <TableStoryExpandableRow row={row} />}
        />
      </div>
    </Section>
  ),
  play: async ({ canvasElement }) => {
    await waitForTable(canvasElement);
    await expectFlush(canvasElement, { expandable: true });
    // The details cell takes no edge inset on top of its content's own.
    await expect(
      px(
        canvasElement.querySelector('[data-testid="expanded-row-cell"]'),
        'padding-left',
      ),
    ).toBe('0px');
  },
};
