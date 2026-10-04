import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTable } from '@/table/useTable';
import { useUser } from '@/workspace/hooks';

import {
  ChangeGidAction,
  ProviderProjectGroupsList,
} from './ProviderProjectGroupsList';

vi.mock('@/table/useTable', () => ({ useTable: vi.fn() }));
vi.mock('@/table/useFilterValues', () => ({
  useFilterValues: vi.fn(() => ({})),
}));
vi.mock('@/core/Link', () => ({
  Link: ({ label }) => <a href="#project">{label}</a>,
}));

vi.mock('@/resource/actions/ActionItem', () => ({
  ActionItem: ({ title }) => <span>{title}</span>,
}));

let tableProps: any;
vi.mock('@/table/Table', () => ({
  default: (props: any) => {
    tableProps = props;
    return (
      <div>
        {props.tableActions}
        {props.placeholderComponent}
      </div>
    );
  },
}));

const provider = {
  uuid: 'provider-uuid',
  customer_uuid: 'provider-customer',
} as any;

const group = {
  uuid: 'group-uuid',
  name: 'my-project',
  gid: 20003,
  in_use: true,
  service_provider_uuid: 'provider-uuid',
  project_uuid: 'project-uuid',
  project_name: 'My project',
  project_slug: 'my-project',
  customer_uuid: 'consumer-customer',
  customer_name: 'Consumer',
  offerings: [{ uuid: 'offering-uuid', name: 'Cluster A' }],
  members: ['alice', 'bob'],
  created: '2026-10-01T10:00:00Z',
  modified: '2026-10-01T10:00:00Z',
} as any;

const owner = {
  is_staff: false,
  permissions: [
    {
      scope_type: 'customer',
      scope_uuid: 'provider-customer',
      role_name: 'CUSTOMER.OWNER',
    },
  ],
} as any;

const offeringManager = {
  is_staff: false,
  permissions: [
    {
      scope_type: 'offering',
      scope_uuid: 'offering-uuid',
      role_name: 'OFFERING.MANAGER',
    },
  ],
} as any;

const renderCell = (title: string, row = group) => {
  const column = tableProps.columns.find((c) => c.title === title);
  return render(<>{column.render({ row })}</>);
};

describe('ProviderProjectGroupsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tableProps = undefined;
    vi.mocked(useTable).mockReturnValue({
      rows: [group],
      fetch: vi.fn(),
      query: '',
      filtersStorage: [],
    } as any);
  });

  it('offers adopting, importing and changing a GID to provider owners', () => {
    vi.mocked(useUser).mockReturnValue(owner);
    render(<ProviderProjectGroupsList provider={provider} />);

    expect(screen.getAllByText('Adopt existing group').length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText('Import groups').length).toBeGreaterThan(0);
    expect(tableProps.rowActions).toBeDefined();
  });

  it('offers staff the same actions', () => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: true,
      permissions: [],
    } as any);
    render(<ProviderProjectGroupsList provider={provider} />);

    expect(tableProps.tableActions).toBeTruthy();
    expect(tableProps.rowActions).toBeDefined();
  });

  it('keeps the list read-only for offering managers', () => {
    vi.mocked(useUser).mockReturnValue(offeringManager);
    render(<ProviderProjectGroupsList provider={provider} />);

    expect(screen.queryByText('Adopt existing group')).not.toBeInTheDocument();
    expect(screen.queryByText('Import groups')).not.toBeInTheDocument();
    expect(tableProps.tableActions).toBeUndefined();
    expect(tableProps.rowActions).toBeUndefined();
  });

  it('lists the provider’s groups', () => {
    vi.mocked(useUser).mockReturnValue(owner);
    render(<ProviderProjectGroupsList provider={provider} />);

    expect(vi.mocked(useTable).mock.calls[0][0].filter).toEqual({
      service_provider_uuid: 'provider-uuid',
    });
    // A failing server reaches the error view after one retry, in place.
    const options = vi.mocked(useTable).mock.calls[0][0];
    expect(options.meta).toEqual({ skipGlobalErrorRedirect: true });
    expect(options.retry).toEqual(expect.any(Function));
    const retry = options.retry as (count: number, error: any) => boolean;
    expect(retry(0, { status: 500 })).toBe(true);
    expect(retry(1, { status: 500 })).toBe(false);
    expect(retry(0, { status: 403 })).toBe(false);
    expect(tableProps.formId).toBe(
      'MarketplaceServiceProviderProjectGroupsFilter',
    );
  });

  it('renders the group’s columns', () => {
    vi.mocked(useUser).mockReturnValue(owner);
    render(<ProviderProjectGroupsList provider={provider} />);

    expect(renderCell('GID').container).toHaveTextContent('20003');
    expect(renderCell('Offerings').container).toHaveTextContent('Cluster A');
    expect(renderCell('Members').container).toHaveTextContent('2');
    expect(renderCell('Status').container).toHaveTextContent('In use');
    // The provider owner holds no role in the consumer's project.
    expect(
      within(renderCell('Project').container).queryByRole('link'),
    ).not.toBeInTheDocument();
  });

  it('links the project for someone with a role in it', () => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: true,
      permissions: [],
    } as any);
    render(<ProviderProjectGroupsList provider={provider} />);

    expect(
      within(renderCell('Project').container).getByRole('link'),
    ).toHaveTextContent('My project');
  });

  it('marks a group without a GID and one of a deleted project', () => {
    vi.mocked(useUser).mockReturnValue(owner);
    render(<ProviderProjectGroupsList provider={provider} />);

    expect(
      renderCell('GID', { ...group, gid: null }).container,
    ).toHaveTextContent('Not assigned');
    expect(
      renderCell('Project', {
        ...group,
        project_uuid: null,
        project_name: null,
      }).container,
    ).toHaveTextContent('Deleted project');
    expect(
      renderCell('Status', { ...group, in_use: false }).container,
    ).toHaveTextContent('Not in use');
  });

  it('tells owners how to set project groups up when there are none', () => {
    vi.mocked(useUser).mockReturnValue(owner);
    vi.mocked(useTable).mockReturnValue({
      rows: [],
      fetch: vi.fn(),
      query: '',
      filtersStorage: [],
    } as any);
    render(<ProviderProjectGroupsList provider={provider} />);

    expect(screen.getByText('No project groups yet')).toBeInTheDocument();
    expect(
      screen.getByText(/enable project groups in the account settings/),
    ).toBeInTheDocument();
  });

  it('gives others no setup instructions', () => {
    vi.mocked(useUser).mockReturnValue(offeringManager);
    render(<ProviderProjectGroupsList provider={provider} />);

    expect(screen.getByText('No project groups to show')).toBeInTheDocument();
    expect(
      screen.queryByText(/enable project groups in the account settings/),
    ).not.toBeInTheDocument();
  });

  it('shows the ordinary empty result while searching', () => {
    vi.mocked(useUser).mockReturnValue(owner);
    vi.mocked(useTable).mockReturnValue({
      rows: [],
      fetch: vi.fn(),
      query: 'nothing',
      filtersStorage: [],
    } as any);
    render(<ProviderProjectGroupsList provider={provider} />);

    expect(screen.queryByText('No project groups yet')).not.toBeInTheDocument();
  });

  it('offers Set GID for a group without one', () => {
    render(<ChangeGidAction row={{ ...group, gid: null }} refetch={vi.fn()} />);
    expect(screen.getByText('Set GID')).toBeInTheDocument();
  });
});
