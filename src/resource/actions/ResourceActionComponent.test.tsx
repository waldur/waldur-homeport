import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ResourceActionComponent } from './ResourceActionComponent';
import { ResourceActionsList } from './ResourceActionsList';
import { ActionItemType } from './types';

const makeAction = (title: string): ActionItemType => {
  const Action = () => <span>{title}</span>;
  Action.displayName = title;
  return Action as ActionItemType;
};

// Stands for a provider action that gates itself on a permission the current
// user does not hold.
const GatedAction: ActionItemType = (() => null) as ActionItemType;

const EditAction = makeAction('Edit');
const PullAction = makeAction('Pull');
const ShowUsageAction = makeAction('Show usage');

const renderMenu = async (props) => {
  const result = renderWithProviders(
    <ResourceActionComponent
      open
      labeled
      resource={{ uuid: 'resource-uuid' }}
      {...props}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: /actions/i }));
  return result;
};

// The groups themselves live in ResourceActionsList, which the menu renders
// through an ActionList that hides the captions and the dialog renders whole.
const renderList = (props) =>
  renderWithProviders(
    <ResourceActionsList resource={{ uuid: 'resource-uuid' }} {...props} />,
  );

describe('ResourceActionComponent', () => {
  it('renders an action listed for both audiences only once', async () => {
    await renderMenu({
      customerResourceActions: [EditAction, PullAction],
      providerResourceActions: [PullAction, ShowUsageAction],
    });

    expect(screen.getAllByText('Pull')).toHaveLength(1);
    expect(screen.getByText('Show usage')).toBeInTheDocument();
  });

  it('offers the rest of the actions behind Show all', async () => {
    await renderMenu({ customerResourceActions: [EditAction] });

    expect(screen.getByText('Show all')).toBeInTheDocument();
  });

  it("keeps a nested resource's few type actions in the menu", async () => {
    // A router or subnet carries only its own actions; collapsing three rows
    // behind "Show all" would hide them for no gain, and the e2e suite drives
    // them straight from the menu.
    await renderMenu({ resourceTypeActions: [PullAction, ShowUsageAction] });

    expect(screen.getByText('Pull')).toBeInTheDocument();
    expect(screen.getByText('Show usage')).toBeInTheDocument();
    expect(screen.queryByText('Show all')).not.toBeInTheDocument();
  });

  it("keeps the resource's own operations beside the collapsed groups", async () => {
    // A VMware VM's Start/Stop/Reset arrive as extraActions. They are not
    // flagged important, but they are the point of the menu — the e2e suite
    // drives them from it, and the collapse exists to make room for them.
    await renderMenu({
      extraActions: [PullAction],
      customerResourceActions: [EditAction],
      staffActions: [ShowUsageAction],
    });

    expect(screen.getByText('Pull')).toBeInTheDocument();
    expect(screen.getByText('Show all')).toBeInTheDocument();
  });

  it('drops the group captions in the menu', async () => {
    await renderMenu({
      customerResourceActions: [EditAction],
      providerResourceActions: [ShowUsageAction],
    });

    expect(screen.queryByText('Resource actions')).not.toBeInTheDocument();
    expect(screen.queryByText('Provider actions')).not.toBeInTheDocument();
  });
});

describe('ResourceActionsList', () => {
  it('omits the provider group when the consumer group already covers it', () => {
    renderList({
      customerResourceActions: [EditAction, ShowUsageAction],
      providerResourceActions: [ShowUsageAction],
    });

    expect(screen.getByText('Resource actions')).toBeInTheDocument();
    expect(screen.queryByText('Provider actions')).not.toBeInTheDocument();
  });

  it('leaves the provider group empty when every provider action is gated', () => {
    // The heading stays in the markup; an empty action list is what the
    // .action-group:has(.action-list:empty) rule keys on to hide the group.
    renderList({ providerResourceActions: [GatedAction] });

    expect(screen.getByText('Provider actions')).toBeInTheDocument();
    expect(screen.getByTestId('action-list')).toBeEmptyDOMElement();
  });
});
