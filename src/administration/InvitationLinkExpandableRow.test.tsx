import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Invitation } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { InvitationLinkExpandableRow } from './InvitationLinkExpandableRow';

const invitation = {
  uuid: '5b9a1d3e6c7f4a8e9b2d1c0f3e4a5b6c',
  email: 'alice@example.com',
  civil_number: '38001010000',
  scope_type: 'customer',
  scope_name: 'Acme Research',
  extra_invitation_text: 'Welcome aboard',
  execution_state: 'OK',
  error_message: 'SMTP rejected the recipient',
} as Invitation;

// Read at call time: `vitest-location-mock` installs its `location` before
// each test, after this module has loaded.
const getLink = () => `${location.origin}/invitation/${invitation.uuid}/`;

describe('InvitationLinkExpandableRow', () => {
  it('shows the invitation link', () => {
    renderWithProviders(<InvitationLinkExpandableRow row={invitation} />);

    expect(screen.getByText(getLink())).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copy to clipboard' }),
    ).toBeInTheDocument();
  });

  // The team lists' expanded row also shows civil number, scope, message and
  // execution state; the admin one must not.
  it('shows nothing but the link', () => {
    const { container } = renderWithProviders(
      <InvitationLinkExpandableRow row={invitation} />,
    );

    expect(container.textContent).toBe(`Invitation link: ${getLink()}`);
  });
});
