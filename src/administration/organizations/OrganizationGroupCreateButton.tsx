import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const OrganizationGroupForm = lazyComponent(() =>
  import('./OrganizationGroupForm').then((module) => ({
    default: module.OrganizationGroupForm,
  })),
);

export const OrganizationGroupCreateButton = ({ refetch }) => (
  <CreateModalButton
    dialog={OrganizationGroupForm}
    resolve={{ refetch }}
    size="lg"
  />
);
