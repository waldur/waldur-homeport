import { UploadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
import { useUser } from '@/workspace/hooks';

const OrganizationImportDialog = lazyComponent(() =>
  import('./OrganizationImportDialog').then((module) => ({
    default: module.OrganizationImportDialog,
  })),
);

export const OrganizationImportButton: FC<{ refetch }> = ({ refetch }) => {
  const user = useUser();
  const { openDialog } = useModal();

  if (!user.is_staff) return null;

  return (
    <BaseButton
      label={translate('Bulk import')}
      onClick={() =>
        openDialog(OrganizationImportDialog, {
          size: 'lg',
          formId: 'BulkImportOrganizations',
          resolve: {
            refetch,
          },
        })
      }
      iconNode={<UploadSimpleIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};
