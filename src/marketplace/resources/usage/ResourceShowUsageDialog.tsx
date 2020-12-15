import { translate } from '@waldur/i18n';
import { ResourceUsageTabsContainer } from '@waldur/marketplace/resources/usage/ResourceUsageTabsContainer';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface ResourceUsageDialogProps {
  resolve: { offeringUuid: string; resourceUuid: string };
}

export const ResourceShowUsageDialog = (props: ResourceUsageDialogProps) => (
  <ModalDialog
    title={translate('Resource usage')}
    footer={<CloseDialogButton />}
  >
    <ResourceUsageTabsContainer
      offeringUuid={props.resolve.offeringUuid}
      resourceUuid={props.resolve.resourceUuid}
    />
  </ModalDialog>
);
