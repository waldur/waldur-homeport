import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTable } from '@/table/useTable';

import { PosixGroupsTable } from './OfferingUsersExpandableRow';

vi.mock('@/table/useTable', () => ({ useTable: vi.fn() }));

let tableProps: any;
vi.mock('@/table/Table', () => ({
  default: (props: any) => {
    tableProps = props;
    return null;
  },
}));

const renderGroupCell = (row: any) => {
  render(<PosixGroupsTable offeringUser={{ uuid: 'ou-uuid' } as any} />);
  const column = tableProps.columns.find((c) => c.title === 'Group');
  return render(<>{column.render({ row })}</>);
};

describe('PosixGroupsTable', () => {
  beforeEach(() => {
    vi.mocked(useTable).mockReturnValue({ rows: [], fetch: vi.fn() } as any);
  });

  it('names the provider project groups the account belongs to', () => {
    renderGroupCell({
      kind: 'provider_project_group',
      group_name: 'my-project',
      service_provider_name: 'HPC Centre',
      gid: 20003,
    });

    expect(screen.getByText('my-project')).toBeInTheDocument();
    expect(screen.getByText('Service provider group')).toBeInTheDocument();
  });

  it('marks the offering’s own project groups', () => {
    renderGroupCell({ kind: 'project_group', gid: 30001 });

    expect(screen.getByText('Offering group')).toBeInTheDocument();
  });
});
