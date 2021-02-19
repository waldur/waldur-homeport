import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { ResourceUsageTabsContainer } from '@waldur/marketplace/resources/usage/ResourceUsageTabsContainer';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface ResourceUsageDialogProps {
  resolve: { resource: { offering_uuid: string; resource_uuid: string } };
}

export const ResourceShowUsageDialog: FunctionComponent<ResourceUsageDialogProps> = (
  props,
) => {
  // eslint-disable-next-line no-console
  console.log('ResourceShowUsageDialog props', props);
  return (
    <ModalDialog
      title={translate('Resource usage')}
      footer={<CloseDialogButton />}
    >
      <ResourceUsageTabsContainer
        offeringUuid={props.resolve.resource.offering_uuid}
        resourceUuid={props.resolve.resource.resource_uuid}
      />
    </ModalDialog>
  );
};
