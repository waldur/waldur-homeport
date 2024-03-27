import { FunctionComponent } from 'react';

import { OrganizationGroupOrganizationsList } from '@waldur/administration/organizations/OrganizationGroupOrganizationsList';
import { translate } from '@waldur/i18n';
import { OrganizationGroup } from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface OrganizationGroupDetailsDialogProps {
  resolve: { organizationGroup: OrganizationGroup };
}

export const OrganizationGroupDetailsDialog: FunctionComponent<
  OrganizationGroupDetailsDialogProps
> = (props) => {
  return (
    <ModalDialog
      title={translate('Organization group details of {orgName}', {
        orgName: props.resolve.organizationGroup.name,
      })}
      footer={
        <div className="flex-grow-1 d-flex justify-content-between">
          <CloseDialogButton label={translate('Done')} />
        </div>
      }
    >
      <OrganizationGroupOrganizationsList
        organizationGroup={props.resolve.organizationGroup}
      />
    </ModalDialog>
  );
};
