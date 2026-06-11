import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ImageUploadGroup } from './ImageUploadField';

describe('ImageUploadGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders browse button when connected to a form', () => {
    render(
      <Form
        onSubmit={vi.fn()}
        render={() => (
          <ImageUploadGroup
            name="images"
            buttonLabel="Browse"
            accept="image/*"
          />
        )}
      />,
    );

    expect(screen.getByRole('button', { name: 'Browse' })).toBeInTheDocument();
  });

  it('connects the field to react-final-form', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <ImageUploadGroup
              name="images"
              buttonLabel="Browse"
              accept="image/*"
            />
            <button type="submit">Save</button>
          </form>
        )}
      />,
    );

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    await user.upload(screen.getByTestId('upload'), file);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith(
      { images: file },
      expect.anything(),
      expect.anything(),
    );
  });
});
