import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { CallLogoSection } from './CallLogoSection';

const call = {
  uuid: 'call-uuid',
  name: 'Production Call',
  image: null,
} as any;

describe('CallLogoSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads a chosen logo as multipart form data', async () => {
    vi.mocked(proposalProtectedCallsPartialUpdate).mockResolvedValue({
      data: {},
    } as any);
    const refetch = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<CallLogoSection call={call} refetch={refetch} />);
    const file = new File(['logo'], 'logo.png', { type: 'image/png' });

    await user.upload(screen.getByTestId('image-upload'), file);
    await user.click(await screen.findByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(proposalProtectedCallsPartialUpdate).toHaveBeenCalled(),
    );
    const request = vi.mocked(proposalProtectedCallsPartialUpdate).mock
      .calls[0][0] as any;
    expect(request.path).toEqual({ uuid: 'call-uuid' });
    expect(request.body.image).toBe(file);
    expect(request.headers['Content-Type']).toBe(null);
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it('offers no save button until a logo is chosen', () => {
    renderWithProviders(<CallLogoSection call={call} refetch={vi.fn()} />);
    expect(
      screen.queryByRole('button', { name: 'Save' }),
    ).not.toBeInTheDocument();
  });

  it('disables the upload for a read-only call', () => {
    renderWithProviders(
      <CallLogoSection call={call} refetch={vi.fn()} isReadOnly />,
    );
    expect(screen.getByTestId('image-upload')).toBeDisabled();
  });
});
