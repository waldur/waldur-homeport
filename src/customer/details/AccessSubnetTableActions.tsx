import { PlusIcon, TargetIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

const AccessSubnetForm = lazyComponent(() =>
  import('./AccessSubnetForm').then((module) => ({
    default: module.AccessSubnetForm,
  })),
);

const AccessSubnetImpactDialog = lazyComponent(() =>
  import('./AccessSubnetImpactDialog').then((module) => ({
    default: module.AccessSubnetImpactDialog,
  })),
);

interface AccessSubnetTableActionsProps {
  customerUrl: string;
  customerUuid: string;
  canManage: boolean;
  refetch(): void;
}

/**
 * Table-level actions, collected under one dropdown.
 *
 * Two standalone buttons crowded the toolbar next to the events button and the
 * filters; the rest of the app puts this many table actions behind a labelled
 * dropdown.
 */
export const AccessSubnetTableActions: FC<AccessSubnetTableActionsProps> = ({
  customerUrl,
  customerUuid,
  canManage,
  refetch,
}) => {
  const { openDialog } = useModal();

  return (
    <ActionsDropdownComponent labeled size="lg" variant="tertiary">
      {canManage && (
        <ActionItem
          title={translate('Add access subnet')}
          iconNode={<PlusIcon weight="bold" />}
          action={() =>
            openDialog(AccessSubnetForm, {
              resolve: {
                refetch,
                customer_url: customerUrl,
                customer_uuid: customerUuid,
              },
              size: 'lg',
            })
          }
        />
      )}
      <ActionItem
        title={translate('Show resource impact')}
        iconNode={<TargetIcon weight="bold" />}
        action={() =>
          openDialog(AccessSubnetImpactDialog, {
            resolve: { customerUuid },
            size: 'xl',
          })
        }
      />
    </ActionsDropdownComponent>
  );
};
