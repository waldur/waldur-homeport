import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ProjectUsersList } from '@/project/team/ProjectUsersList';

export const ResourceTeamDialog = ({ resolve }) => {
  return (
    <ModalDialog
      title={translate('Team')}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <ProjectUsersList
        hideTabs={true}
        project={{
          uuid: resolve.resource?.project_uuid,
          name: resolve.resource?.project_name,
          customer_uuid: resolve.resource?.customer_uuid,
          url: resolve.resource?.project,
        }}
      />
    </ModalDialog>
  );
};
