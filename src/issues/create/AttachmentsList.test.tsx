import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from '@/core/api';

import { AttachmentsList } from './AttachmentsList';

vi.mock('@/core/api');

describe('AttachmentsList', () => {
  const attachment = {
    name: 'guide.pdf',
    file: 'http://example.com/api/media/abc/',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:file');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  });

  it('downloads template files through the authenticated client', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'get').mockResolvedValue(new Blob(['x']) as any);

    render(<AttachmentsList attachments={[attachment]} />);

    // A plain link would open the media URL without the API token.
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /guide\.pdf/ }));

    expect(api.get).toHaveBeenCalledWith(attachment.file);
  });

  it('does not submit the surrounding form', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'get').mockResolvedValue(new Blob(['x']) as any);
    const onSubmit = vi.fn((event) => event.preventDefault());

    render(
      <form onSubmit={onSubmit}>
        <AttachmentsList attachments={[attachment]} />
      </form>,
    );
    await user.click(screen.getByRole('button', { name: /guide\.pdf/ }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
