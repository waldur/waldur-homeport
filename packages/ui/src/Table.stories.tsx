import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatusPill } from './StatusPill';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './Table';

const meta: Meta<typeof Table> = {
  title: 'Data Display/Table',
  component: Table,
  parameters: {
    docs: {
      description: {
        component:
          'Low-level Table primitive (Table, TableHeader, TableBody, TableRow, TableHead, TableCell) with horizontal overflow scrolling, surface border tokens, and hover row effects. Serves as the foundation for DataTable.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => (
    <div className="p-6 bg-[var(--surface-page-bg)]">
      <div className="rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Instance</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Monthly Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">gpu-worker-node-01</TableCell>
              <TableCell>OpenStack Cloud</TableCell>
              <TableCell className="font-mono text-xs">192.168.10.12</TableCell>
              <TableCell>
                <StatusPill label="Active" tone="success" />
              </TableCell>
              <TableCell className="text-right font-medium">
                85.00 EUR
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">database-primary</TableCell>
              <TableCell>PostgreSQL Cluster</TableCell>
              <TableCell className="font-mono text-xs">192.168.10.45</TableCell>
              <TableCell>
                <StatusPill label="Running" tone="neutral" />
              </TableCell>
              <TableCell className="text-right font-medium">
                120.00 EUR
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                web-frontend-staging
              </TableCell>
              <TableCell>Kubernetes Pod</TableCell>
              <TableCell className="font-mono text-xs">192.168.10.88</TableCell>
              <TableCell>
                <StatusPill label="Risk" tone="warning" />
              </TableCell>
              <TableCell className="text-right font-medium">
                25.00 EUR
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  ),
};
