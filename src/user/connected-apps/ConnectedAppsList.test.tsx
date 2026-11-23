import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getAuthHeader } from 'waldur-auth-core';

import { ImpersonationStorage } from '@/core/StorageManager';
import { useTable } from '@/table/useTable';

import { ConnectedAppsList } from './ConnectedAppsList';

vi.mock('waldur-auth-core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('waldur-auth-core')>()),
  getAuthHeader: vi.fn(),
}));
vi.mock('@/table/useTable', () => ({ useTable: vi.fn() }));
vi.mock('@/table/Table', () => ({
  default: ({ columns, rows, emptyMessage }) =>
    rows.length ? (
      <ul>
        {rows.map((row) =>
          columns.map((column) => (
            <li key={row.uuid + column.title} aria-label={column.title}>
              {column.render({ row })}
            </li>
          )),
        )}
      </ul>
    ) : (
      <p>{emptyMessage}</p>
    ),
}));

const app = {
  uuid: 'app-1',
  client_name: 'Claude Code',
  client_host: null,
  redirect_hosts: ['localhost'],
  registration_source: 'dcr',
  scopes: [{ name: 'mcp:read', description: 'Read your Waldur data' }],
  authorized_at: '2026-11-10T10:00:00Z',
  last_used_at: null,
};

const renderWith = (rows) => {
  vi.mocked(useTable).mockReturnValue({ rows, fetch: vi.fn() } as any);
  render(<ConnectedAppsList />);
};

const cell = (title: string) => screen.getByLabelText(title);

describe('ConnectedAppsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    ImpersonationStorage.remove();
    vi.mocked(getAuthHeader).mockReset();
  });

  it('shows a self-registered app by the host it sends the user back to', () => {
    renderWith([app]);
    expect(cell('Application')).toHaveTextContent('Claude Code');
    expect(cell('Host')).toHaveTextContent('localhost');
    expect(cell('Registered via')).toHaveTextContent('Self-registered (DCR)');
    expect(cell('Scopes')).toHaveTextContent('Read your Waldur data');
  });

  it('shows a metadata document app by its own host', () => {
    renderWith([
      {
        ...app,
        client_name: 'Claude',
        client_host: 'claude.ai',
        redirect_hosts: ['claude.ai', 'claude.com'],
        registration_source: 'cimd',
      },
    ]);
    expect(cell('Host')).toHaveTextContent('claude.ai');
    expect(cell('Registered via')).toHaveTextContent(
      'Metadata document (CIMD)',
    );
  });

  it('names an app an administrator added', () => {
    renderWith([{ ...app, registration_source: 'manual' }]);
    expect(cell('Registered via')).toHaveTextContent(
      'Added by an administrator',
    );
  });

  it('does not call an unknown kind of registration admin-added', () => {
    renderWith([{ ...app, registration_source: 'federation' }]);
    expect(cell('Registered via')).toHaveTextContent('federation');
  });

  it('explains the empty list', () => {
    renderWith([]);
    expect(
      screen.getByText(/such as AI assistants connected through MCP/),
    ).toBeInTheDocument();
  });

  it('shows a note instead of loading the list while impersonating', () => {
    ImpersonationStorage.set('user-uuid');
    renderWith([app]);
    expect(
      screen.getByText(
        'Only the user can see and revoke their connected apps.',
      ),
    ).toBeInTheDocument();
    expect(useTable).not.toHaveBeenCalled();
    expect(screen.queryByText('Claude Code')).not.toBeInTheDocument();
  });

  it('shows a note instead of loading the list for an OIDC access token', () => {
    vi.mocked(getAuthHeader).mockReturnValue('Bearer idp-token');
    renderWith([app]);
    expect(
      screen.getByText(
        'Connected apps cannot be managed when you sign in with an access token.',
      ),
    ).toBeInTheDocument();
    expect(useTable).not.toHaveBeenCalled();
  });

  it.each([
    [
      'while impersonating',
      () => ImpersonationStorage.set('user-uuid'),
      'Only the user can see and revoke their connected apps.',
    ],
    [
      'for an OIDC access token',
      () => vi.mocked(getAuthHeader).mockReturnValue('Bearer idp-token'),
      'Connected apps cannot be managed when you sign in with an access token.',
    ],
  ])('shows how to connect above the note %s', (_, setUp, refusal) => {
    setUp();
    renderWith([]);
    const heading = screen.getByText('Connect an AI client');
    const note = screen.getByText(refusal);
    expect(
      heading.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('opens how to connect while the user has no connected apps', () => {
    renderWith([]);
    expect(screen.getByRole('button', { name: 'Toggle' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('collapses how to connect once the user has a connected app', () => {
    renderWith([app]);
    expect(screen.getByRole('button', { name: 'Toggle' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('loads the list for a Waldur token, as after a local or passkey sign-in', () => {
    vi.mocked(getAuthHeader).mockReturnValue('Token waldur-token');
    renderWith([app]);
    expect(cell('Application')).toHaveTextContent('Claude Code');
  });
});
