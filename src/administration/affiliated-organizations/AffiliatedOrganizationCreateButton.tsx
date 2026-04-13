import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const AffiliatedOrganizationForm = lazyComponent(() =>
  import('./AffiliatedOrganizationForm').then((module) => ({
    default: module.AffiliatedOrganizationForm,
  })),
);

export const AffiliatedOrganizationCreateButton = ({ refetch }) => (
  <CreateModalButton
    dialog={AffiliatedOrganizationForm}
    resolve={{ refetch }}
    size="lg"
  />
);
