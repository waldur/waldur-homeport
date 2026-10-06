import { FunctionComponent } from 'react';

import { BaseButton, Menu } from 'waldur-ui';

import { translate } from '@/i18n';
import { ActionList } from '@/marketplace/resources/actions/ActionList';
import { ModalActionsDialog } from '@/marketplace/resources/actions/ModalActionsDialog';
import { useModal } from '@/modal/actions';
import { ActionsMenu } from '@/table/ActionsDropdown';

import {
  ResourceActionsList,
  ResourceActionsListProps,
} from './ResourceActionsList';

interface ResourceActionComponentProps extends ResourceActionsListProps {
  onToggle?: (isOpen: boolean) => void;
  disabled?: boolean;
  open?: boolean;
  loading?: boolean;
  error?: object;
  labeled?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  size?: 'sm' | 'lg';
}

/**
 * A resource's row menu: the actions marked `important`, then "Show all" for
 * the rest in a searchable dialog. A resource carries twenty-odd actions
 * across its three groups, which as a single menu runs the full height of the
 * window. The OpenStack resources already used this shape through
 * ActionsPopover; this gives every other resource the same one.
 */
export const ResourceActionComponent: FunctionComponent<
  ResourceActionComponentProps
> = ({
  onToggle,
  disabled,
  open,
  loading,
  error,
  labeled,
  side,
  size,
  ...listProps
}) => {
  const { openDialog } = useModal();

  // Collapse the row menu only. It is the one that covers the screen: the
  // kebab sits at the edge of a table row and its panel opens over the page.
  // The labeled Actions button on a resource's own page is somewhere the user
  // navigated to on purpose, and both that page and the e2e suite expect its
  // full list. Collapsing also needs the marketplace groups to collapse — a
  // menu of type actions alone is a few rows already.
  const isLongMenu =
    !labeled &&
    Boolean(
      listProps.customerResourceActions?.length ||
      listProps.providerResourceActions?.length ||
      listProps.staffActions?.length,
    );

  const showAll = () =>
    openDialog(ModalActionsDialog, {
      name: listProps.resource?.name,
      refetch: listProps.refetch,
      resource: listProps.resource,
      marketplaceResource: listProps.marketplaceResource,
      className: 'resource-actions-modal',
      title: listProps.resource?.name
        ? translate('Actions for {name}', { name: listProps.resource.name })
        : translate('Resource actions'),
      ActionsList: () => <ResourceActionsList {...listProps} />,
    });

  return (
    <ActionsMenu
      toggle={labeled ? 'labeled' : 'kebab'}
      onOpenChange={onToggle}
      disabled={disabled}
      side={side}
      size={size}
    >
      {!open ? null : loading ? (
        <Menu.Item disabled>{translate('Loading actions')}</Menu.Item>
      ) : error ? (
        <Menu.Item disabled>{translate('Unable to load actions')}</Menu.Item>
      ) : !isLongMenu ? (
        // A nested resource (router, subnet, port) carries only its own few
        // type actions. Collapsing those behind "Show all" would hide a
        // three-row menu behind a click, so they stay as they were.
        <ResourceActionsList {...listProps} />
      ) : (
        <>
          {/* The resource's own operations (Start, Stop, Reset, …) stay in
              the menu whatever happens: they are what the menu is for, and
              burying them behind "Show all" is what the collapse is meant to
              spare them from. Only the marketplace, provider and staff groups
              are filtered down to the important few. */}
          <ResourceActionsList
            {...listProps}
            customerResourceActions={undefined}
            providerResourceActions={undefined}
            staffActions={undefined}
          />
          <ActionList hideGroupName hideNonImportant>
            <ResourceActionsList
              {...listProps}
              extraActions={undefined}
              resourceTypeActions={undefined}
            />
          </ActionList>
          <Menu.Separator />
          {/* A button, not an action row: it opens a dialog rather than doing
              anything to the resource. Deliberately outside Menu.Item — a row
              overrides a nested button's own colour and hover, so inside one
              it stops looking like a button at all. */}
          <div className="flex justify-center p-1">
            <BaseButton
              variant="text-secondary"
              size="sm"
              label={translate('Show all')}
              onClick={showAll}
            />
          </div>
        </>
      )}
    </ActionsMenu>
  );
};
