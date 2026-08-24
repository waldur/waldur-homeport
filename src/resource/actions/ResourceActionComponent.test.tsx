import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ResourceActionComponent } from './ResourceActionComponent';
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

describe('ResourceActionComponent', () => {
  it('renders an action listed for both audiences only once', async () => {
    await renderMenu({
      customerResourceActions: [EditAction, PullAction],
      providerResourceActions: [PullAction, ShowUsageAction],
    });

    expect(screen.getAllByText('Pull')).toHaveLength(1);
    expect(screen.getByText('Show usage')).toBeInTheDocument();
  });

  it('omits the provider group when the consumer group already covers it', async () => {
    await renderMenu({
      customerResourceActions: [EditAction, ShowUsageAction],
      providerResourceActions: [ShowUsageAction],
    });

    expect(screen.getByText('Resource actions')).toBeInTheDocument();
    expect(screen.queryByText('Provider actions')).not.toBeInTheDocument();
  });

  it('leaves the provider group empty when every provider action is gated', async () => {
    // Staff actions only satisfy the "menu has something to show" branch; the
    // user is not staff, so the provider group is the only one rendered.
    await renderMenu({
      staffActions: [EditAction],
      providerResourceActions: [GatedAction],
    });

    // The heading stays in the markup; an empty action list is what the
    // .action-group:has(.action-list:empty) rule keys on to hide the group.
    expect(screen.getByText('Provider actions')).toBeInTheDocument();
    expect(screen.getByTestId('action-list')).toBeEmptyDOMElement();
  });
});
