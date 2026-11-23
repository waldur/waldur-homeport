import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { saveFile } from '@/core/saveFile';
import { renderWithProviders } from '@/test/harness';

import { PersonalAccessTokenSecretDialog } from './PersonalAccessTokenSecretDialog';

vi.mock('@/core/saveFile', () => ({ saveFile: vi.fn() }));

const TOKEN = 'waldur_pat_0123456789abcdef';
const CONFIG = `offerings:\n  - waldur_api_token: "${TOKEN}"\n`;

const editorValue = () =>
  (screen.getByTestId('monaco-editor') as HTMLTextAreaElement).value;

describe('PersonalAccessTokenSecretDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const render = () =>
    renderWithProviders(
      <PersonalAccessTokenSecretDialog
        resolve={{ token: TOKEN, tokenName: 'Agent', agentConfig: CONFIG }}
      />,
    );

  it('masks the token in the agent configuration until it is revealed', async () => {
    const user = userEvent.setup();
    render();

    await screen.findByTestId('monaco-editor');
    expect(editorValue()).not.toContain(TOKEN);
    expect(editorValue()).toContain(TOKEN.slice(0, 10));

    await user.click(screen.getByRole('button', { name: 'Show token' }));
    expect(editorValue()).toContain(TOKEN);
  });

  it('copies and downloads the configuration with the real token', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    render();

    await user.click(screen.getByRole('button', { name: /Download YAML/ }));
    const blob = vi.mocked(saveFile).mock.calls[0][0] as Blob;
    expect(await blob.text()).toBe(CONFIG);

    const config = screen.getByTestId('site-agent-config');
    // The token's copy button comes first in the dialog, the config's last.
    const copyButtons = within(config).getAllByRole('button', {
      name: /Copy/i,
    });
    await user.click(copyButtons[0]);
    expect(writeText).toHaveBeenCalledWith(CONFIG);
  });

  it('shows no agent configuration for an ordinary token', () => {
    renderWithProviders(
      <PersonalAccessTokenSecretDialog
        resolve={{ token: TOKEN, tokenName: 'CI' }}
      />,
    );
    expect(screen.queryByTestId('site-agent-config')).not.toBeInTheDocument();
  });

  it('names the new user a dedicated token was created for', () => {
    renderWithProviders(
      <PersonalAccessTokenSecretDialog
        resolve={{
          token: TOKEN,
          tokenName: 'Agent',
          agentConfig: CONFIG,
          username: 'agent-hpc',
        }}
      />,
    );
    expect(screen.getByTestId('agent-username')).toHaveTextContent('agent-hpc');
  });
});
