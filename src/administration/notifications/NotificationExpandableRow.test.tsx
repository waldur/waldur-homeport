import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { NotificationExpandableRow } from './NotificationExpandableRow';

const renderRow = (template: Record<string, unknown>) =>
  renderWithProviders(
    <NotificationExpandableRow
      row={{
        templates: [
          {
            uuid: 'template-uuid',
            path: 'users/invitation_created_subject.txt',
            ...template,
          },
        ],
      }}
    />,
  );

describe('NotificationExpandableRow', () => {
  let writeText;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  });

  // The API returns content: null for a template nobody has overridden and
  // serves its default text as original_content.
  it('shows and copies the default text of a template that is not overridden', async () => {
    renderRow({
      content: null,
      original_content: 'You have been invited',
      is_content_overridden: false,
    });

    expect(screen.getByText('You have been invited')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Copy/ }));
    expect(writeText).toHaveBeenCalledWith('You have been invited');
  });

  it('shows and copies the overridden text of a template', async () => {
    renderRow({
      content: 'Custom invitation',
      original_content: 'You have been invited',
      is_content_overridden: true,
    });

    expect(screen.getByText('Custom invitation')).toBeInTheDocument();
    expect(screen.queryByText('You have been invited')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Copy/ }));
    expect(writeText).toHaveBeenCalledWith('Custom invitation');
  });
});
