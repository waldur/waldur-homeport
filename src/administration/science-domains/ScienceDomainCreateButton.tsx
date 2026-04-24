import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const ScienceDomainForm = lazyComponent(() =>
  import('./ScienceDomainForm').then((module) => ({
    default: module.ScienceDomainForm,
  })),
);

export const ScienceDomainCreateButton = ({ refetch }) => (
  <CreateModalButton dialog={ScienceDomainForm} resolve={{ refetch }} />
);
