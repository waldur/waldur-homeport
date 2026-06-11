import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceProviderOfferingsUpdateImage,
  marketplaceProviderOfferingsUpdateThumbnail,
} from 'waldur-js-client';

import { Offering } from '@/marketplace/types';
import { renderWithProviders } from '@/test/harness';

import { UpdateOfferingMediaDialog } from './UpdateOfferingMediaDialog';

const mockOffering = {
  uuid: 'offering-uuid',
  image: 'https://example.com/image.png',
  thumbnail: 'https://example.com/thumb.png',
} as Offering;

describe('UpdateOfferingMediaDialog', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDialog = (mediaType: 'image' | 'thumbnail' = 'image') =>
    renderWithProviders(
      <UpdateOfferingMediaDialog
        resolve={{
          offering: mockOffering,
          refetch: mockRefetch,
          mediaType,
        }}
      />,
    );

  it('renders update image dialog with upload control', () => {
    renderDialog('image');

    expect(screen.getByText('Update image')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Browse' })).toBeInTheDocument();
    expect(screen.getByAltText('Image here')).toBeInTheDocument();
  });

  it('renders update logo dialog for thumbnail media type', () => {
    renderDialog('thumbnail');

    expect(screen.getByText('Update logo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Browse' })).toBeInTheDocument();
    expect(screen.getByAltText('Logo here')).toBeInTheDocument();
  });

  it('submits offering image update', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceProviderOfferingsUpdateImage).mockResolvedValue(
      {} as any,
    );

    renderDialog('image');

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    await user.upload(screen.getByTestId('upload'), file);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(marketplaceProviderOfferingsUpdateImage).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'offering-uuid' },
          body: { image: file },
        }),
      );
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('submits offering thumbnail update', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceProviderOfferingsUpdateThumbnail).mockResolvedValue(
      {} as any,
    );

    renderDialog('thumbnail');

    const file = new File(['hello'], 'logo.png', { type: 'image/png' });
    await user.upload(screen.getByTestId('upload'), file);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(marketplaceProviderOfferingsUpdateThumbnail).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'offering-uuid' },
          body: { thumbnail: file },
        }),
      );
    });

    expect(mockRefetch).toHaveBeenCalled();
  });
});
