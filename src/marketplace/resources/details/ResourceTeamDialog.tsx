import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { ProjectUsersList } from '@/project/team/ProjectUsersList';

export const ResourceTeamDialog = ({ resolve }) => {
  return (
    <ModalDialog
      title={translate('Team')}
      subtitle={
        <ScopeSubtitle
          label={translate('Resource name')}
          name={resolve.resource?.name}
        />
      }
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
