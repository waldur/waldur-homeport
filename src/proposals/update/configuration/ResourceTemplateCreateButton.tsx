import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { Call } from '@/proposals/types';

const ResourceTemplateFormDialog = lazyComponent(() =>
  import('./ResourceTemplateFormDialog').then((module) => ({
    default: module.ResourceTemplateFormDialog,
  })),
);

interface OwnProps {
  call: Call;
  refetch(): void;
}

export const ResourceTemplateCreateButton = ({ call, refetch }: OwnProps) => (
  <CreateModalButton
    dialog={ResourceTemplateFormDialog}
    resolve={{ call, refetch }}
    size="lg"
    formId="CallResourceTemplateForm"
  />
);
