import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { Project } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useUser } from '@/workspace/hooks';

import { ProjectVersionHistoryAction } from './ProjectVersionHistoryAction';

const project = { uuid: 'project-uuid', name: 'Castle Black' } as Project;

describe('ProjectVersionHistoryAction', () => {
  const mockOpenDialog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useModal as Mock).mockReturnValue({
      openDialog: mockOpenDialog,
      closeDialog: vi.fn(),
    });
  });

  it('renders nothing when user is neither staff nor support', () => {
    (useUser as Mock).mockReturnValue({ is_staff: false, is_support: false });
    const { container } = render(
      <ProjectVersionHistoryAction project={project} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    ['staff', { is_staff: true, is_support: false }],
    ['support', { is_staff: false, is_support: true }],
  ])('opens the project history dialog for %s', async (_, currentUser) => {
    (useUser as Mock).mockReturnValue(currentUser);
    render(<ProjectVersionHistoryAction project={project} />);

    await userEvent.setup().click(screen.getByText('Version history'));

    expect(mockOpenDialog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        size: 'xl',
        resolve: expect.objectContaining({
          entityType: 'project',
          entityUuid: 'project-uuid',
          entityName: 'Castle Black',
        }),
      }),
    );
  });
});
