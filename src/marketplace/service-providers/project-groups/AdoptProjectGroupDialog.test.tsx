import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceServiceProviderProjectGroupsAdoptableProjectsList,
  marketplaceServiceProviderProjectGroupsCreate,
  marketplaceServiceProviderProjectGroupsList,
  projectsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { AdoptProjectGroupDialog } from './AdoptProjectGroupDialog';

// The project picker loads options asynchronously; a button stands in for
// choosing one.
const h = vi.hoisted(() => ({
  option: { uuid: 'project-uuid', name: 'My project' } as Record<
    string,
    unknown
  >,
}));

vi.mock('@/form', async (importOriginal) => {
  const original: any = await importOriginal();
  return {
    ...original,
    AsyncSelectGroup: ({
      name,
      validate,
      getOptionLabel,
      isOptionDisabled,
    }) => {
      const option = h.option;
      return (
        <Field name={name} validate={validate}>
          {({ input }) => (
            <button
              type="button"
              disabled={isOptionDisabled(option)}
              onClick={() => input.onChange(option)}
            >
              {getOptionLabel(option)}
            </button>
          )}
        </Field>
      );
    },
  };
});

vi.mock('@/form/select/createLoadOptions', () => ({
  createLoadOptions: vi.fn(() => vi.fn()),
}));

const provider = { uuid: 'provider-uuid' } as any;

const renderDialog = () =>
  renderWithProviders(
    <AdoptProjectGroupDialog resolve={{ provider, refetch: vi.fn() }} />,
  );

describe('AdoptProjectGroupDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ is_staff: false } as any);
    h.option = { uuid: 'project-uuid', name: 'My project' };
    vi.mocked(marketplaceServiceProviderProjectGroupsList).mockResolvedValue({
      data: [],
    } as any);
  });

  it('adopts a group with its GID and name', async () => {
    vi.mocked(marketplaceServiceProviderProjectGroupsCreate).mockResolvedValue({
      data: {},
    } as any);
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByText('My project'));
    await user.type(screen.getByLabelText(/^GID/), '20001');
    await user.type(screen.getByLabelText(/Group name/), 'alpha');
    await user.click(screen.getByRole('button', { name: 'Adopt' }));

    await waitFor(() =>
      expect(
        marketplaceServiceProviderProjectGroupsCreate,
      ).toHaveBeenCalledWith({
        body: {
          service_provider: 'provider-uuid',
          project: 'project-uuid',
          gid: 20001,
          name: 'alpha',
          allow_outside_range: false,
        },
      }),
    );
  });

  it('refuses a name the directory would not accept', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByText('My project'));
    await user.type(screen.getByLabelText(/^GID/), '20001');
    await user.type(screen.getByLabelText(/Group name/), 'My Project');

    expect(screen.getByRole('button', { name: 'Adopt' })).toBeDisabled();
  });

  it('shows why the backend refused the adoption', async () => {
    vi.mocked(marketplaceServiceProviderProjectGroupsCreate).mockRejectedValue({
      response: { status: 400 },
      non_field_errors: ['The project already has a group; use set_gid.'],
    });
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByText('My project'));
    await user.type(screen.getByLabelText(/^GID/), '20001');
    await user.click(screen.getByRole('button', { name: 'Adopt' }));

    expect(
      await screen.findByText('The project already has a group; use set_gid.'),
    ).toBeInTheDocument();
  });

  it('re-enables adopting once the refused GID is edited', async () => {
    vi.mocked(marketplaceServiceProviderProjectGroupsCreate).mockRejectedValue({
      response: { status: 400 },
      status: 400,
      statusText: 'Bad Request',
      gid: ['GID 20002 is already in use at this service provider.'],
    });
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByText('My project'));
    const gid = screen.getByLabelText(/^GID/);
    await user.type(gid, '20002');
    await user.click(screen.getByRole('button', { name: 'Adopt' }));
    expect(
      await screen.findByText(
        'GID 20002 is already in use at this service provider.',
      ),
    ).toBeInTheDocument();

    await user.clear(gid);
    await user.type(gid, '20051');

    expect(
      screen.queryByText(
        'GID 20002 is already in use at this service provider.',
      ),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adopt' })).toBeEnabled();
  });

  it('disables a project the adoptable list names a group for', () => {
    h.option = {
      uuid: 'project-uuid',
      name: 'My project',
      group_name: 'my-project',
    };
    renderDialog();

    expect(
      screen.getByText('My project — has group my-project'),
    ).toBeDisabled();
  });

  it('looks up only the selected project, never the whole group list', async () => {
    vi.mocked(marketplaceServiceProviderProjectGroupsList).mockResolvedValue({
      data: [{ project_uuid: 'project-uuid', name: 'my-project', gid: 20003 }],
    } as any);
    const user = userEvent.setup();
    renderDialog();

    expect(marketplaceServiceProviderProjectGroupsList).not.toHaveBeenCalled();
    await user.click(screen.getByText('My project'));
    await user.type(screen.getByLabelText(/^GID/), '20001');

    expect(await screen.findByTestId('existing-group')).toHaveTextContent(
      'This project already has group my-project with GID 20003. Use Change GID on it instead.',
    );
    expect(marketplaceServiceProviderProjectGroupsList).toHaveBeenCalledWith({
      query: {
        service_provider_uuid: 'provider-uuid',
        project_uuid: 'project-uuid',
      },
    });
    expect(screen.getByRole('button', { name: 'Adopt' })).toBeDisabled();
  });

  it('refuses a GID outside the POSIX range or with a fraction', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByText('My project'));
    const gid = screen.getByLabelText(/^GID/);
    await user.type(gid, '999');
    expect(screen.getByRole('button', { name: 'Adopt' })).toBeDisabled();
    await user.clear(gid);
    await user.type(gid, '20001');
    expect(screen.getByRole('button', { name: 'Adopt' })).toBeEnabled();
  });

  it('lists the projects the owner may adopt for', () => {
    renderDialog();

    expect(
      marketplaceServiceProviderProjectGroupsAdoptableProjectsList,
    ).not.toHaveBeenCalled();
    expect(createLoadOptions).toHaveBeenCalledWith(
      marketplaceServiceProviderProjectGroupsAdoptableProjectsList,
      'query',
      { service_provider_uuid: 'provider-uuid' },
    );
  });

  it('starts staff on the projects using the provider, with a switch to all', async () => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    const user = userEvent.setup();
    renderDialog();

    expect(vi.mocked(createLoadOptions).mock.calls.at(-1)?.[0]).toBe(
      marketplaceServiceProviderProjectGroupsAdoptableProjectsList,
    );
    await user.click(
      screen.getByLabelText(
        'Show all projects, not only those using this service provider',
      ),
    );
    expect(vi.mocked(createLoadOptions).mock.calls.at(-1)?.[0]).toBe(
      projectsList,
    );
  });

  it('gives owners no switch to all projects', () => {
    renderDialog();

    expect(
      screen.queryByLabelText(
        'Show all projects, not only those using this service provider',
      ),
    ).not.toBeInTheDocument();
  });

  it('shows a refusal inline only, without a toast repeating it', async () => {
    vi.mocked(marketplaceServiceProviderProjectGroupsCreate).mockRejectedValue({
      response: { status: 400 },
      status: 400,
      gid: ['20002 is already used by project group climate-models.'],
    });
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByText('My project'));
    await user.type(screen.getByLabelText(/^GID/), '20002');
    await user.click(screen.getByRole('button', { name: 'Adopt' }));

    expect(
      await screen.findByText(
        '20002 is already used by project group climate-models.',
      ),
    ).toBeInTheDocument();
    expect(useNotify().showErrorResponse).not.toHaveBeenCalled();
  });

  it('still toasts an error the dialog cannot show', async () => {
    vi.mocked(marketplaceServiceProviderProjectGroupsCreate).mockRejectedValue({
      response: { status: 500 },
      status: 500,
    });
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByText('My project'));
    await user.type(screen.getByLabelText(/^GID/), '20002');
    await user.click(screen.getByRole('button', { name: 'Adopt' }));

    await waitFor(() =>
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        expect.anything(),
        'Unable to adopt the project group.',
      ),
    );
  });
});
