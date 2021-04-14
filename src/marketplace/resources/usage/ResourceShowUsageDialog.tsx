import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/marketplace/resources/types';
import { ResourceUsageTabsContainer } from '@waldur/marketplace/resources/usage/ResourceUsageTabsContainer';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface ResourceUsageDialogProps {
  resolve: {
    resource: Resource;
  };
}

export const ResourceShowUsageDialog: FunctionComponent<ResourceUsageDialogProps> = ({
  resolve,
}) => (
  <ModalDialog
    title={translate('Resource usage for {resourceName}', {
      resourceName: resolve.resource.name,
    })}
    footer={<CloseDialogButton />}
  >
    <ResourceUsageTabsContainer resource={resolve.resource} />
  </ModalDialog>
);
