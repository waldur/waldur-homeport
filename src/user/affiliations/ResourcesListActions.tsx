import { EyeIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';

const ResourceDetailsDialog = lazyComponent(() =>
  import('@/marketplace/resources/details/popup/ResourceDetailsDialog').then(
    (module) => ({
      default: module.ResourceDetailsDialog,
    }),
  ),
);

export const ResourcesListActions = ({ row, fetch }) => {
  const dispatch = useDispatch();
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        ({ row }) => (
          <ActionItem
            title={translate('View details')}
            iconNode={<EyeIcon weight="bold" />}
            action={() =>
              dispatch(
                openModalDialog(ResourceDetailsDialog, {
                  resolve: { resource: row },
                  size: 'lg',
                }),
              )
            }
          />
        ),
      ]}
    />
  );
};
