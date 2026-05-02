import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const ResourceProjectForm = lazyComponent(() =>
  import('./ResourceProjectForm').then((module) => ({
    default: module.ResourceProjectForm,
  })),
);

export const ResourceProjectEditButton = ({
  row,
  refetch,
  resource,
  offering,
  siblings,
}) => (
  <EditModalButton
    dialog={ResourceProjectForm}
    row={row}
    buildResolve={(r) => ({
      resourceProject: r,
      resource,
      offering,
      siblings,
      refetch,
    })}
  />
);
