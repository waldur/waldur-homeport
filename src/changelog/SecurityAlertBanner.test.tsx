import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { SecurityAlertBanner } from './SecurityAlertBanner';
import { SecurityAlert } from './types';

const alert = (overrides: Partial<SecurityAlert> = {}): SecurityAlert => ({
  max_urgency: 'high',
  count: 2,
  versions: [{ version: '8.1.3', max_urgency: 'high' }],
  ...overrides,
});

describe('SecurityAlertBanner', () => {
  beforeEach(() => sessionStorage.clear());

  it('shows the summary and the running version', () => {
    render(<SecurityAlertBanner alert={alert()} currentVersion="8.1.2" />);
    expect(screen.getByText('Security update available')).toBeInTheDocument();
    expect(
      screen.getByText('2 security fixes pending, High urgency.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Your version \(8\.1\.2\) is affected\./),
    ).toBeInTheDocument();
    expect(screen.getByText(/Fixed in 8\.1\.3\./)).toBeInTheDocument();
  });

  it('cannot be dismissed when critical', () => {
    render(
      <SecurityAlertBanner
        alert={alert({ max_urgency: 'critical' })}
        currentVersion="8.1.2"
      />,
    );
    expect(screen.getByText('Security alert')).toBeInTheDocument();
    expect(screen.queryByLabelText('Dismiss')).not.toBeInTheDocument();
  });

  it('stays dismissed for the same alert only', async () => {
    const { unmount } = render(
      <SecurityAlertBanner alert={alert()} currentVersion="8.1.2" />,
    );
    await userEvent.click(screen.getByLabelText('Dismiss'));
    expect(screen.queryByText('Security update available')).toBeNull();
    unmount();

    render(<SecurityAlertBanner alert={alert()} currentVersion="8.1.2" />);
    expect(screen.queryByText('Security update available')).toBeNull();
  });

  it('shows a different alert of the same urgency after a dismissal', async () => {
    const { unmount } = render(
      <SecurityAlertBanner alert={alert()} currentVersion="8.1.2" />,
    );
    await userEvent.click(screen.getByLabelText('Dismiss'));
    unmount();

    render(
      <SecurityAlertBanner
        alert={alert({
          versions: [{ version: '8.1.4', max_urgency: 'high' }],
        })}
        currentVersion="8.1.2"
      />,
    );
    expect(screen.getByText('Security update available')).toBeInTheDocument();
  });
});
