import { FunctionComponent } from 'react';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const CallTemplateFormDialog = lazyComponent(() =>
  import('./CallTemplateFormDialog').then((module) => ({
    default: module.CallTemplateFormDialog,
  })),
);

export const CallTemplateCreateButton: FunctionComponent<{
  refetch(): void;
}> = ({ refetch }) => (
  <CreateModalButton
    dialog={CallTemplateFormDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
