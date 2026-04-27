import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

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
