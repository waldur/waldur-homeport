import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsResourcesDestroy,
  proposalProposalsResourcesList,
  proposalProposalsResourcesSet,
} from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { tablesReducer as tables } from '@/table/store';
import { renderWithProviders } from '@/test/harness';

import { ResourceRequestTemplates } from './ResourceRequestTemplates';

const template = (uuid: string, name: string) =>
  ({
    uuid,
    url: `https://api/templates/${uuid}/`,
    name,
    requested_offering_uuid: 'offering-1',
    requested_offering_name: 'GH200',
    requested_offering_type: 'Marketplace.Slurm',
    requested_offering_components: [],
    requested_offering_plan: null,
    attributes: {},
    limits: {},
  }) as any;

const basic = template('basic', 'Basic tier');
const long = template('long', 'Long tier');

const callWith = (mode: 'single' | 'multiple') =>
  ({
    uuid: 'call-1',
    resource_templates: [basic, long],
    resource_template_selection_mode: mode,
  }) as any;

const proposal = { uuid: 'proposal-1', call_uuid: 'call-1' } as any;

const mockSavedRequests = (requests: any[]) =>
  vi.mocked(proposalProposalsResourcesList).mockResolvedValue({
    data: requests,
  } as any);

const renderTemplates = (mode: 'single' | 'multiple') => {
  const store = createStore(combineReducers({ tables }));
  const ui = (call) => (
    <Provider store={store}>
      <DrawerProvider>
        <ResourceRequestTemplates call={call} proposal={proposal} />
      </DrawerProvider>
    </Provider>
  );
  const result = renderWithProviders(ui(callWith(mode)));
  // The save hook reads the call from the query cache.
  result.queryClient.setQueryData(['publicCall', 'call-1'], callWith(mode));
  return { ...result, rerenderWithCall: (call) => result.rerender(ui(call)) };
};

describe('ResourceRequestTemplates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSavedRequests([]);
  });

  it('offers checkboxes when several templates may be combined', async () => {
    renderTemplates('multiple');
    await screen.findByText('Basic tier');
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
  });

  it('offers one radio per template when only one may be chosen', async () => {
    renderTemplates('single');
    await screen.findByText('Basic tier');
    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('has nothing to save right after a single-mode draft loads', async () => {
    mockSavedRequests([
      { uuid: 'request-1', call_resource_template: basic.url },
    ]);
    renderTemplates('single');
    await waitFor(() => {
      expect(screen.getAllByRole('radio')[0]).toBeChecked();
    });
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it("restores a draft's saved template in single mode", async () => {
    mockSavedRequests([
      { uuid: 'request-1', call_resource_template: basic.url },
    ]);
    renderTemplates('single');
    await waitFor(() => {
      expect(screen.getAllByRole('radio')[0]).toBeChecked();
    });
    expect(screen.getAllByRole('radio')[1]).not.toBeChecked();
  });

  it('keeps an unsaved choice when the call reloads with new objects', async () => {
    mockSavedRequests([
      { uuid: 'request-1', call_resource_template: basic.url },
    ]);
    const { rerenderWithCall } = renderTemplates('single');
    await waitFor(() => {
      expect(screen.getAllByRole('radio')[0]).toBeChecked();
    });
    await userEvent.click(screen.getAllByRole('radio')[1]);

    const reloaded = callWith('single');
    reloaded.resource_templates = reloaded.resource_templates.map((t) => ({
      ...t,
    }));
    rerenderWithCall(reloaded);

    await waitFor(() => {
      expect(screen.getAllByRole('radio')[1]).toBeChecked();
    });
    expect(screen.getAllByRole('radio')[0]).not.toBeChecked();
  });

  it('warns when a single-template draft holds several requests', async () => {
    mockSavedRequests([
      { uuid: 'request-1', call_resource_template: basic.url },
      { uuid: 'request-2', call_resource_template: long.url },
    ]);
    renderTemplates('single');
    expect(
      await screen.findByText('This proposal holds several resource requests'),
    ).toBeInTheDocument();
  });

  it('keeps Save disabled in single mode until a template is chosen', async () => {
    mockSavedRequests([{ uuid: 'request-1', call_resource_template: null }]);
    renderTemplates('single');
    await screen.findByText(
      "This proposal's resource request is not from a template",
    );
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();

    await userEvent.click(screen.getAllByRole('radio')[0]);

    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
  });

  it('keeps the ticked templates once a request not from a template is gone', async () => {
    // The warning disappearing used to remount the table, which clears its
    // selection, so Save then offered to delete every request.
    vi.mocked(proposalProposalsResourcesList)
      .mockResolvedValueOnce({
        data: [
          { uuid: 'request-1', call_resource_template: null },
          { uuid: 'request-2', call_resource_template: basic.url },
        ],
      } as any)
      .mockResolvedValue({
        data: [{ uuid: 'request-2', call_resource_template: basic.url }],
      } as any);
    vi.mocked(proposalProposalsResourcesDestroy).mockResolvedValue({} as any);

    renderTemplates('multiple');
    await screen.findByText('Some resource requests are not from a template');
    await waitFor(() => {
      expect(
        screen.getAllByRole('checkbox', { name: 'Select row' })[0],
      ).toBeChecked();
    });
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(
        screen.queryByText('Some resource requests are not from a template'),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getAllByRole('checkbox', { name: 'Select row' })[0],
    ).toBeChecked();
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('warns in multiple mode about a request not made from a template', async () => {
    mockSavedRequests([{ uuid: 'request-1', call_resource_template: null }]);
    renderTemplates('multiple');
    expect(
      await screen.findByText('Some resource requests are not from a template'),
    ).toBeInTheDocument();
  });

  it('warns when the single request was not made from a template', async () => {
    mockSavedRequests([{ uuid: 'request-1', call_resource_template: null }]);
    renderTemplates('single');
    expect(
      await screen.findByText(
        "This proposal's resource request is not from a template",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('radio')[0]).not.toBeChecked();
    expect(screen.getAllByRole('radio')[1]).not.toBeChecked();
  });

  it('does not add a template when removing the old one failed', async () => {
    mockSavedRequests([
      { uuid: 'request-1', call_resource_template: basic.url },
    ]);
    vi.mocked(proposalProposalsResourcesDestroy).mockRejectedValue(
      new Error('forbidden'),
    );

    renderTemplates('single');
    await waitFor(() => {
      expect(screen.getAllByRole('radio')[0]).toBeChecked();
    });
    await userEvent.click(screen.getAllByRole('radio')[1]);
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(proposalProposalsResourcesDestroy).toHaveBeenCalled(),
    );
    expect(proposalProposalsResourcesSet).not.toHaveBeenCalled();
  });

  it('still adds ticked templates in multiple mode when a removal fails', async () => {
    mockSavedRequests([
      { uuid: 'request-1', call_resource_template: basic.url },
    ]);
    vi.mocked(proposalProposalsResourcesDestroy).mockRejectedValue(
      new Error('forbidden'),
    );
    vi.mocked(proposalProposalsResourcesSet).mockResolvedValue({} as any);

    renderTemplates('multiple');
    await waitFor(() => {
      expect(
        screen.getAllByRole('checkbox', { name: 'Select row' })[0],
      ).toBeChecked();
    });
    const boxes = screen.getAllByRole('checkbox', { name: 'Select row' });
    await userEvent.click(boxes[0]);
    await userEvent.click(boxes[1]);
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(proposalProposalsResourcesSet).toHaveBeenCalledWith({
        path: { uuid: 'proposal-1' },
        body: { call_resource_template_uuid: 'long' },
      }),
    );
  });

  it('removes the replaced template before adding the new one', async () => {
    mockSavedRequests([
      { uuid: 'request-1', call_resource_template: basic.url },
    ]);
    const calls: string[] = [];
    let finishRemoval: () => void;
    vi.mocked(proposalProposalsResourcesDestroy).mockImplementation(
      () =>
        new Promise((resolve) => {
          calls.push('remove');
          finishRemoval = () => resolve({} as any);
        }) as any,
    );
    vi.mocked(proposalProposalsResourcesSet).mockImplementation(() => {
      calls.push('add');
      return Promise.resolve({} as any) as any;
    });

    renderTemplates('single');
    await waitFor(() => {
      expect(screen.getAllByRole('radio')[0]).toBeChecked();
    });
    await userEvent.click(screen.getAllByRole('radio')[1]);
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(calls).toEqual(['remove']));
    finishRemoval();
    await waitFor(() => expect(calls).toEqual(['remove', 'add']));
    expect(proposalProposalsResourcesDestroy).toHaveBeenCalledWith({
      path: { uuid: 'proposal-1', obj_uuid: 'request-1' },
    });
    expect(proposalProposalsResourcesSet).toHaveBeenCalledWith({
      path: { uuid: 'proposal-1' },
      body: { call_resource_template_uuid: 'long' },
    });
  });
});
