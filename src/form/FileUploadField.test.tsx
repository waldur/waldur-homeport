import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, it, expect, vi } from 'vitest';

import { FileUploadField, FileUploadFieldProps } from './FileUploadField';

describe('FileUploadField', () => {
  const mockInput = {
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props?: Partial<FileUploadFieldProps>) => {
    render(
      <FileUploadField
        input={mockInput as any}
        buttonLabel="Upload"
        {...props}
      />,
    );
  };

  it('renders the button with the correct label', () => {
    renderComponent();
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('renders default file name', () => {
    renderComponent({ showFileName: true });
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('accepts files that match the specified MIME type', async () => {
    const user = userEvent.setup();
    renderComponent({ accept: 'image/png', showFileName: true });
    const validFile = new File(['dummy content'], 'image.png', {
      type: 'image/png',
    });

    const inputElement = screen.getByTestId('upload');
    await user.upload(inputElement, validFile);

    expect(screen.getByText('image.png')).toBeInTheDocument();
    expect(mockInput.onChange).toHaveBeenCalledWith(validFile);
  });

  it('rejects files that do not match the specified MIME type', () => {
    renderComponent({ accept: 'image/jpeg' });
    const invalidFile = new File(['dummy content'], 'image.png', {
      type: 'image/png',
    });

    const inputElement = screen.getByTestId('upload');
    // Using fireEvent here to bypass userEvent's strict accept check
    // to test the component's internal fallback validation.
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.change(inputElement, { target: { files: [invalidFile] } });

    expect(screen.queryByText('image.png')).not.toBeInTheDocument();
    expect(mockInput.onChange).toHaveBeenCalledWith(null);
  });

  it('handles onChange correctly when a valid file is selected', async () => {
    const user = userEvent.setup();
    renderComponent();
    const file = new File(['dummy content'], 'example.txt', {
      type: 'text/plain',
    });

    const inputElement = screen.getByTestId('upload');
    await user.upload(inputElement, file);

    expect(mockInput.onChange).toHaveBeenCalledWith(file);
  });

  it('handles onChange correctly when no file is selected', () => {
    renderComponent();
    const inputElement = screen.getByTestId('upload');

    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.change(inputElement, { target: { files: [] } });

    expect(mockInput.onChange).toHaveBeenCalledWith(null);
  });
});
