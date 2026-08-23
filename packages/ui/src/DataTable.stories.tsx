import type { Meta, StoryObj } from '@storybook/react-vite';

import { DataTable, DataTableColumn } from './DataTable';
import { StatusPill, StatusTone } from './StatusPill';

interface ProjectRow {
  name: string;
  status: string;
  statusTone: StatusTone;
  members: number;
  monthlySpend: string;
}

const rows: ProjectRow[] = [
  {
    name: 'Proteomics 2026',
    status: 'Active',
    statusTone: 'success',
    members: 12,
    monthlySpend: '€2,140',
  },
  {
    name: 'Genomics reference',
    status: 'Running',
    statusTone: 'neutral',
    members: 8,
    monthlySpend: '€1,640',
  },
  {
    name: 'Climate downscale',
    status: 'Quota risk',
    statusTone: 'warning',
    members: 6,
    monthlySpend: '€980',
  },
  {
    name: 'Archive 2025',
    status: 'Closed',
    statusTone: 'neutral',
    members: 3,
    monthlySpend: '—',
  },
];

const columns: DataTableColumn<ProjectRow>[] = [
  { key: 'name', header: 'Project', render: (row) => row.name },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusPill label={row.status} tone={row.statusTone} />,
  },
  { key: 'members', header: 'Members', render: (row) => row.members },
  {
    key: 'monthlySpend',
    header: 'Monthly spend',
    render: (row) => row.monthlySpend,
  },
];

const meta: Meta<typeof DataTable> = {
  title: 'Dashboard/DataTable',
  parameters: {
    docs: {
      description: {
        component:
          'New dashboard primitive, structure/styling only — see DataTable.tsx.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof DataTable<ProjectRow>>;

/** Roughly the mockup's Projects table. */
export const ProjectsTable: Story = {
  render: () => (
    <DataTable columns={columns} rows={rows} rowKey={(row) => row.name} />
  ),
};
