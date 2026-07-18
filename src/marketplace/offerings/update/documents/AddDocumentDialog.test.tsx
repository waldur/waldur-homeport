import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceOfferingFilesCreate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { AddDocumentDialog } from './AddDocumentDialog';

const fakeOffering = {
  url: 'offering-url',
  uuid: 'offering-uuid',
  name: 'Test offering',
} as any;

const renderDialog = () => {
  const refetch = vi.fn();
  const result = renderWithProviders(
    <AddDocumentDialog resolve={{ offering: fakeOffering, refetch }} />,
  );
  return { ...result, refetch };
};

const uploadFile = async (
  user: ReturnType<typeof userEvent.setup>,
  name = 'guide.pdf',
) => {
  const file = new File(['dummy content'], name, { type: 'application/pdf' });
  const input = screen.getByTestId('file-uploader');
  await user.upload(input, file);
  return file;
};

describe('AddDocumentDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with the Save button disabled until a file is added', () => {
    renderDialog();
    expect(screen.getByText('Add documents')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('enables Save and shows a name field once a file is dropped', async () => {
    const user = userEvent.setup();
    renderDialog();

    await uploadFile(user);

    expect(
      await screen.findByLabelText(/Name for guide.pdf/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();
  });

  it('uploads the file and defaults the name to the file name', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceOfferingFilesCreate).mockResolvedValue({} as any);
    const { refetch } = renderDialog();

    await uploadFile(user, 'guide.pdf');
    await screen.findByLabelText(/Name for guide.pdf/i);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(marketplaceOfferingFilesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            offering: 'offering-url',
            name: 'guide.pdf',
            file: expect.any(File),
          }),
        }),
      );
    });
    expect(refetch).toHaveBeenCalled();
  });

  it('uses the entered name instead of the file name when provided', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceOfferingFilesCreate).mockResolvedValue({} as any);
    renderDialog();

    await uploadFile(user, 'guide.pdf');
    const nameInput = await screen.findByLabelText(/Name for guide.pdf/i);
    await user.type(nameInput, 'User Guide');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(marketplaceOfferingFilesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            offering: 'offering-url',
            name: 'User Guide',
          }),
        }),
      );
    });
  });
});
