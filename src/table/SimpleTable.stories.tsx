import type { Meta, StoryObj } from '@storybook/react-vite';

import { SimpleTable } from './SimpleTable';

interface OrgRow {
  uuid: string;
  name: string;
  projects: number;
  cost: string;
}

/**
 * `SimpleTable` — a short list of rows already in memory (reporting
 * summaries, a dialog's list), with the main table's header and row look but
 * none of its fetching, paging, sorting or filters.
 */
const meta: Meta<typeof SimpleTable<OrgRow>> = {
  title: 'Data Display/Table/SimpleTable',
  component: SimpleTable,
  decorators: [
    (Story) => (
      <div className="p-6 bg-primary rounded-lg border-[1px] border-secondary max-w-[720px]">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof SimpleTable<OrgRow>>;

const rows: OrgRow[] = [
  { uuid: '1', name: 'University of Tartu', projects: 42, cost: '12 400 EUR' },
  { uuid: '2', name: 'Tallinn University', projects: 17, cost: '5 210 EUR' },
  {
    uuid: '3',
    name: 'Estonian University of Life Sciences',
    projects: 9,
    cost: '1 980 EUR',
  },
];

export const Populated: Story = {
  args: {
    rows,
    columns: [
      { title: 'Organization', render: ({ row }) => <>{row.name}</> },
      {
        title: 'Projects',
        render: ({ row }) => <>{row.projects}</>,
        className: 'text-end',
        headerClassName: 'text-end',
      },
      {
        title: 'Cost',
        render: ({ row }) => <>{row.cost}</>,
        className: 'text-end',
        headerClassName: 'text-end',
      },
    ],
  },
};

export const Empty: Story = {
  args: { ...Populated.args, rows: [] },
};
