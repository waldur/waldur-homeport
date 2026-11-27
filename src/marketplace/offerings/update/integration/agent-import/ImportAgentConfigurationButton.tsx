import { UploadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasAllPermissions } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

const ImportAgentConfigurationDialog = lazyComponent(() =>
  import('./ImportAgentConfigurationDialog').then((module) => ({
    default: module.ImportAgentConfigurationDialog,
  })),
);

interface ImportAgentConfigurationButtonProps {
  offering: Pick<ProviderOfferingDetails, 'uuid' | 'customer_uuid'>;
  refetch?(): Promise<any> | void;
}

/**
 * Opens the import of an agent configuration file. Shown only to who may
 * update the offering's integration and change its agent configuration, as
 * the import may change every part of it.
 */
export const ImportAgentConfigurationButton: FC<
  ImportAgentConfigurationButtonProps
> = ({ offering, refetch }) => {
  const user = useUser();
  const { openDialog } = useModal();
  const canImport = hasAllPermissions(
    user,
    [
      PermissionEnum.UPDATE_OFFERING_INTEGRATION,
      PermissionEnum.UPDATE_OFFERING_AGENT_CONFIGURATION,
    ],
    { customerId: offering.customer_uuid, offeringId: offering.uuid },
  );
  if (!canImport) {
    return null;
  }
  return (
    <BaseButton
      label={translate('Import configuration')}
      iconNode={<UploadSimpleIcon weight="bold" />}
      variant="tertiary"
      onClick={() =>
        openDialog(ImportAgentConfigurationDialog, {
          size: 'lg',
          // A wizard holds a file and choices: Escape or a click beside it
          // must not throw them away. Cancel and the close button still do.
          keyboard: false,
          backdrop: 'static',
          resolve: { offeringUuid: offering.uuid, refetch },
        })
      }
    />
  );
};
