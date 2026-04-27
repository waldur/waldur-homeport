import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

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
