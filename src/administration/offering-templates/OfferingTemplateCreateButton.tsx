import { FunctionComponent } from 'react';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const OfferingTemplateFormDialog = lazyComponent(() =>
  import('./OfferingTemplateFormDialog').then((module) => ({
    default: module.OfferingTemplateFormDialog,
  })),
);

export const OfferingTemplateCreateButton: FunctionComponent<{
  refetch(): void;
}> = ({ refetch }) => (
  <CreateModalButton
    dialog={OfferingTemplateFormDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
