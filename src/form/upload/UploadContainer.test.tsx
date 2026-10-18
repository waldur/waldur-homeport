import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UploadContainer } from './UploadContainer';

describe('UploadContainer', () => {
  it('labels its hidden file input', () => {
    render(<UploadContainer onDrop={() => undefined} />);
    expect(screen.getByLabelText('Upload files')).toHaveAttribute(
      'type',
      'file',
    );
  });

  it('takes a more specific input label', () => {
    render(
      <UploadContainer
        onDrop={() => undefined}
        inputLabel="Attach documents"
      />,
    );
    expect(screen.getByLabelText('Attach documents')).toBeInTheDocument();
  });

  it('leaves one keyboard-reachable upload button', () => {
    render(<UploadContainer onDrop={() => undefined} />);
    // The icon shortcut is hidden from assistive technology and the tab
    // order; "Click to upload" is the button everyone gets.
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: 'Click to upload' }),
    ).toBeInTheDocument();
  });
});
