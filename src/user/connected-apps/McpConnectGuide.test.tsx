import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { useUser } from '@/workspace/hooks';

import { McpConnectGuide } from './McpConnectGuide';

vi.mock('@/core/Link', () => ({
  Link: ({ state, label, children }) => (
    <a href={`#${state}`}>{label ?? children}</a>
  ),
}));

const URL = 'https://api.example.com/mcp';
const COMMAND = `claude mcp add --transport http waldur ${URL}`;

const member = { is_staff: false, is_support: false };

const renderAs = (user, hasApps?: boolean) => {
  vi.mocked(useUser).mockReturnValue(user);
  return render(<McpConnectGuide hasApps={hasApps} />);
};

const row = (label: string | RegExp) => screen.queryByText(label);

const STEPS = 'Run this command in a terminal.';
const TOKEN = "Can't sign in through the browser?";
const STAFF = /^Staff and support:/;

// The guide's own toggle; the token block nested in it has one too.
const guideToggle = () => screen.getAllByRole('button', { name: 'Toggle' })[0];

describe('McpConnectGuide', () => {
  beforeEach(() => {
    ENV.plugins.WALDUR_CORE.MCP_RESOURCE_URLS = `${URL} https://other.example.com/mcp`;
    ENV.plugins.WALDUR_CORE.PAT_ENABLED = true;
  });

  afterEach(() => {
    ENV.plugins.WALDUR_CORE.MCP_RESOURCE_URLS = undefined;
    ENV.plugins.WALDUR_CORE.PAT_ENABLED = undefined;
  });

  it('shows the first URL in the command and the client config', async () => {
    const user = userEvent.setup();
    renderAs(member, false);

    expect(screen.getByText(URL)).toBeInTheDocument();
    expect(screen.queryByText(/other\.example\.com/)).not.toBeInTheDocument();
    expect(screen.getByText(COMMAND)).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Other clients' }));
    // The code block shows the config one line per row.
    expect(screen.getByText(`"url": "${URL}"`)).toBeInTheDocument();
    expect(screen.queryByText(COMMAND)).not.toBeInTheDocument();
  });

  // Adding the server does not open a browser; Claude Code signs in from /mcp.
  it('tells Claude Code users to sign in from /mcp', () => {
    renderAs(member, false);
    expect(screen.getByText(/run \/mcp and select waldur/)).toBeVisible();
  });

  it('copies the URL and the command as shown', async () => {
    const user = userEvent.setup();
    renderAs(member, false);

    const copied = [];
    for (const button of screen.getAllByRole('button', {
      name: 'Copy to clipboard',
    })) {
      await user.click(button);
      copied.push(await navigator.clipboard.readText());
    }

    expect(copied).toEqual([URL, COMMAND]);
  });

  it('copies the client config on the Other clients tab', async () => {
    const user = userEvent.setup();
    renderAs(member, false);

    const copied = [];
    const copyAll = async () => {
      for (const button of screen.getAllByRole('button', {
        name: 'Copy to clipboard',
      })) {
        await user.click(button);
        copied.push(await navigator.clipboard.readText());
      }
    };
    await user.click(screen.getByRole('tab', { name: 'Other clients' }));
    await copyAll();

    expect(copied).toEqual([
      URL,
      JSON.stringify(
        { mcpServers: { waldur: { type: 'http', url: URL } } },
        null,
        2,
      ),
    ]);
  });

  it('links the documentation in a new tab', () => {
    renderAs(member, false);

    const link = screen.getByRole('link', {
      name: /Connect AI clients over MCP/,
    });
    expect(link).toHaveAttribute(
      'href',
      'https://docs.waldur.com/latest/user-guide/end-users/mcp-clients/',
    );
    expect(link).toHaveAttribute('target', '_blank');
  });

  describe('token block', () => {
    it('is hidden from a user who cannot create tokens', () => {
      renderAs(member, false);
      expect(row(TOKEN)).not.toBeInTheDocument();
    });

    it('shows to a user allowed to create tokens, with a link to them', async () => {
      const user = userEvent.setup();
      renderAs({ ...member, can_use_personal_access_tokens: true }, false);
      expect(row(TOKEN)).toBeInTheDocument();
      await user.click(screen.getByText(TOKEN));
      expect(screen.getByText('Authorization: Bearer <token>')).toBeVisible();
      expect(
        screen.getByRole('link', { name: 'Personal access tokens' }),
      ).toHaveAttribute('href', '#profile-personal-access-tokens');
    });

    it('shows to staff', () => {
      renderAs({ ...member, is_staff: true }, false);
      expect(row(TOKEN)).toBeInTheDocument();
    });

    it('is hidden when tokens are turned off', () => {
      ENV.plugins.WALDUR_CORE.PAT_ENABLED = false;
      renderAs({ ...member, is_staff: true }, false);
      expect(row(TOKEN)).not.toBeInTheDocument();
    });
  });

  describe('staff and support note', () => {
    it('is hidden from other users', () => {
      renderAs({ ...member, can_use_personal_access_tokens: true }, false);
      expect(row(STAFF)).not.toBeInTheDocument();
    });

    it.each([
      ['staff', { is_staff: true }],
      ['support', { is_support: true }],
    ])('shows to %s', (_, flags) => {
      renderAs({ ...member, ...flags }, false);
      expect(row(STAFF)).toBeInTheDocument();
    });
  });

  describe('without MCP_RESOURCE_URLS', () => {
    beforeEach(() => {
      ENV.plugins.WALDUR_CORE.MCP_RESOURCE_URLS = '';
    });

    it('asks for the administrator instead of showing a URL', () => {
      renderAs({ ...member, can_use_personal_access_tokens: true }, false);

      expect(screen.getByText(/Ask your administrator/)).toBeInTheDocument();
      expect(row('Server URL')).not.toBeInTheDocument();
      expect(row(STEPS)).not.toBeInTheDocument();
      expect(row('Other clients')).not.toBeInTheDocument();
      expect(row(TOKEN)).toBeInTheDocument();
    });

    it('hides the note when collapsed', () => {
      renderAs(member, true);
      expect(screen.getByText(/Ask your administrator/)).not.toBeVisible();
    });
  });

  describe('collapsing', () => {
    it('is open for a user without connected apps', () => {
      renderAs(member, false);
      expect(guideToggle()).toHaveAttribute('aria-expanded', 'true');
      expect(row(STEPS)).toBeVisible();
    });

    it('is closed for a user with connected apps', () => {
      renderAs(member, true);

      expect(screen.getByText(URL)).not.toBeVisible();
      expect(row(STEPS)).not.toBeVisible();
      expect(guideToggle()).toHaveAttribute('aria-expanded', 'false');
    });

    it('stays collapsed while the list loads', () => {
      renderAs(member, undefined);
      expect(row(STEPS)).not.toBeVisible();
    });

    it('opens and closes on the toggle', async () => {
      const user = userEvent.setup();
      renderAs(member, true);

      await user.click(guideToggle());
      expect(row(STEPS)).toBeVisible();

      await user.click(guideToggle());
      await waitFor(() => expect(row(STEPS)).not.toBeVisible());
    });

    it('keeps the choice the user made when the list changes', async () => {
      const user = userEvent.setup();
      const { rerender } = renderAs(member, true);

      await user.click(guideToggle());
      rerender(<McpConnectGuide hasApps={true} />);
      expect(row(STEPS)).toBeVisible();
    });
  });
});
