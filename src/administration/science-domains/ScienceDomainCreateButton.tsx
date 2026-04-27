import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const ScienceDomainForm = lazyComponent(() =>
  import('./ScienceDomainForm').then((module) => ({
    default: module.ScienceDomainForm,
  })),
);

export const ScienceDomainCreateButton = ({ refetch }) => (
  <CreateModalButton dialog={ScienceDomainForm} resolve={{ refetch }} />
);
