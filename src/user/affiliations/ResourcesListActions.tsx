import { EyeIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

const ResourceDetailsDialog = lazyComponent(() =>
  import('@waldur/marketplace/resources/details/popup/ResourceDetailsDialog').then(
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
