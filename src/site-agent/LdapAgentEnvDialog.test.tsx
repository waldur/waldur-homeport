import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { LdapAgentEnvDialog } from './LdapAgentEnvDialog';

describe('LdapAgentEnvDialog', () => {
  const user = userEvent.setup();

  const mockOffering = {
    uuid: 'offering-uuid',
    name: 'Test Offering',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and generates environment', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <LdapAgentEnvDialog resolve={{ offering: mockOffering }} />,
    );

    expect(
      screen.getByText('Generate LDAP Agent Environment'),
    ).toBeInTheDocument();

    // Fill required fields
    const usernameInput = screen.getByLabelText('Username');
    await user.clear(usernameInput);
    await user.type(usernameInput, 'ldap-admin');

    const passwordInput = screen.getByLabelText('Password');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'secret-pass');

    const emailInput = screen.getByLabelText('Email');
    await user.clear(emailInput);
    await user.type(emailInput, 'admin@example.com');

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Generate' })).toBeEnabled(),
    );
    await user.click(screen.getByRole('button', { name: 'Generate' }));

    // Switch to preview
    expect(screen.getByText('LDAP Agent Environment')).toBeInTheDocument();

    const monacoEditor = screen.getByTestId(
      'monaco-editor',
    ) as HTMLTextAreaElement;
    expect(monacoEditor.value).toContain('LDAP_ADMIN_USERNAME=ldap-admin');

    // Back to form
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(
      screen.getByText('Generate LDAP Agent Environment'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toHaveValue('ldap-admin');

    // Close
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Generate' })).toBeEnabled(),
    );
    await user.click(screen.getByRole('button', { name: 'Generate' }));
    const footer = screen.getByTestId('modal-footer');
    await user.click(within(footer).getByRole('button', { name: 'Close' }));
    expect(useModal().closeDialog).toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    renderWithProviders(
      <LdapAgentEnvDialog resolve={{ offering: mockOffering }} />,
    );

    const generateButton = () =>
      screen.getByRole('button', { name: 'Generate' });

    // Initially disabled
    expect(generateButton()).toBeDisabled();

    // Trigger validation error
    const usernameInput = screen.getByLabelText('Username');
    await user.clear(usernameInput);
    await user.type(usernameInput, 'test');
    await user.clear(usernameInput);

    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/field is required/i)).toBeInTheDocument();
      expect(generateButton()).toBeDisabled();
    });
  });
});
