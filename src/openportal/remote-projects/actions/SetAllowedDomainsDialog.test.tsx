import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openportalRemoteProjectsSetAllowedDomains } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { SetAllowedDomainsDialog } from './SetAllowedDomainsDialog';

const renderDialog = (allowed_domains: string[] | null | undefined) =>
  renderWithProviders(
    <SetAllowedDomainsDialog
      row={{ uuid: 'rp-1', allowed_domains } as any}
      resolve={{ refetch: vi.fn() }}
    />,
  );

const save = () =>
  userEvent.click(screen.getByRole('button', { name: 'Save' }));

const sent = () =>
  waitFor(() =>
    expect(openportalRemoteProjectsSetAllowedDomains).toHaveBeenCalled(),
  ).then(
    () =>
      vi.mocked(openportalRemoteProjectsSetAllowedDomains).mock.calls[0][0].body
        .allowed_domains,
  );

describe('SetAllowedDomainsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(openportalRemoteProjectsSetAllowedDomains).mockResolvedValue(
      {} as any,
    );
  });

  it('keeps an unrestricted project unrestricted when saved unchanged', async () => {
    renderDialog(null);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    await save();
    expect(await sent()).toBeNull();
  });

  it('lifts the restriction by sending null', async () => {
    renderDialog(['*.example.org']);
    await userEvent.click(
      screen.getByRole('checkbox', { name: /Restrict who may join/ }),
    );
    await save();
    expect(await sent()).toBeNull();
  });

  it('sends an empty list, which admits nobody, while restricted', async () => {
    renderDialog([]);
    expect(screen.getByRole('textbox')).toHaveValue('');
    await save();
    expect(await sent()).toEqual([]);
  });

  it('sends the listed domains', async () => {
    renderDialog(null);
    await userEvent.click(
      screen.getByRole('checkbox', { name: /Restrict who may join/ }),
    );
    await userEvent.type(screen.getByRole('textbox'), '*.ac.uk, *.example.org');
    await save();
    expect(await sent()).toEqual(['*.ac.uk', '*.example.org']);
  });

  it('warns that an empty list admits nobody', async () => {
    renderDialog([]);
    expect(
      screen.getByText('Nobody will be able to join.'),
    ).toBeInTheDocument();

    await userEvent.type(screen.getByRole('textbox'), '*.ac.uk');
    expect(
      screen.queryByText('Nobody will be able to join.'),
    ).not.toBeInTheDocument();
  });

  it('does not warn while unrestricted', () => {
    renderDialog(null);
    expect(
      screen.queryByText('Nobody will be able to join.'),
    ).not.toBeInTheDocument();
  });

  it('does not start unrestricted, or save, when the value is not known', async () => {
    renderDialog(undefined);
    expect(
      screen.getByRole('checkbox', { name: /Restrict who may join/ }),
    ).toBeChecked();
    expect(
      screen.getByText(
        'The current allowed domains could not be loaded, so they cannot be changed here.',
      ),
    ).toBeInTheDocument();
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();
    await userEvent.click(saveButton);
    expect(openportalRemoteProjectsSetAllowedDomains).not.toHaveBeenCalled();
  });
});
