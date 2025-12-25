import { EditModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const ProjectTemplateDialog = lazyComponent(() =>
  import('./ProjectTemplateDialog').then((module) => ({
    default: module.ProjectTemplateDialog,
  })),
);

export const ProjectTemplateEditButton = ({ row, refetch }) => (
  <EditModalButton
    dialog={ProjectTemplateDialog}
    row={row}
    buildResolve={(r) => ({ uuid: r.uuid, refetch })}
    size="lg"
  />
);
