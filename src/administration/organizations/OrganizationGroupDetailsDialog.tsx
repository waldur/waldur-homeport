import { FunctionComponent } from 'react';
import { OrganizationGroup } from 'waldur-js-client';

import { OrganizationGroupOrganizationsList } from '@/administration/organizations/OrganizationGroupOrganizationsList';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

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
