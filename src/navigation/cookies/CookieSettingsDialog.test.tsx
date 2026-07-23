import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { CookieSettingsDialog } from './CookieSettingsDialog';

const close = vi.fn();

describe('CookieSettingsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders cookie categories', () => {
    render(<CookieSettingsDialog close={close} />);

    expect(screen.getByText('Cookie settings')).toBeInTheDocument();
    expect(screen.getByText('Essential cookies')).toBeInTheDocument();
    expect(screen.getByText('Analytics cookies')).toBeInTheDocument();
    expect(screen.getByText('Marketing cookies')).toBeInTheDocument();
    expect(screen.getByText('Functional cookies')).toBeInTheDocument();
    expect(screen.getByText('View Privacy Policy')).toBeInTheDocument();
  });

  it('keeps essential cookies enabled and locked', () => {
    render(<CookieSettingsDialog close={close} />);

    const toggles = screen.getAllByRole('checkbox');
    expect(toggles[0]).toBeChecked();
    expect(toggles[0]).toBeDisabled();
  });

  it('disables optional cookie toggles as placeholders', () => {
    render(<CookieSettingsDialog close={close} />);

    const toggles = screen.getAllByRole('checkbox');
    expect(toggles).toHaveLength(4);
    toggles.slice(1).forEach((toggle) => {
      expect(toggle).toBeDisabled();
      expect(toggle).not.toBeChecked();
    });
  });

  it('closes dialog on save', async () => {
    const user = userEvent.setup();
    render(<CookieSettingsDialog close={close} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(close).toHaveBeenCalledTimes(1);
  });

  it('closes dialog on cancel', async () => {
    const user = userEvent.setup();
    render(<CookieSettingsDialog close={close} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(close).toHaveBeenCalledTimes(1);
  });
});
