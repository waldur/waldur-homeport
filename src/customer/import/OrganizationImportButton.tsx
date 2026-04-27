import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';

const OrganizationImportDialog = lazyComponent(() =>
  import('./OrganizationImportDialog').then((module) => ({
    default: module.OrganizationImportDialog,
  })),
);

export const OrganizationImportButton: FC<{ refetch }> = ({ refetch }) => {
  const user = useUser();
  const dispatch = useDispatch();

  if (!user.is_staff) return null;

  return (
    <ActionButton
      title={translate('Bulk import')}
      action={() =>
        dispatch(
          openModalDialog(OrganizationImportDialog, {
            size: 'lg',
            formId: 'BulkImportOrganizations',
            resolve: {
              refetch,
            },
          }),
        )
      }
      iconNode={<DownloadSimpleIcon weight="bold" />}
    />
  );
};
