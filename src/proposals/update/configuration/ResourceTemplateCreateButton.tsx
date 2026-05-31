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
  disabled?: boolean;
  tooltip?: string;
}

export const ResourceTemplateCreateButton = ({
  call,
  refetch,
  disabled,
  tooltip,
}: OwnProps) => (
  <CreateModalButton
    dialog={ResourceTemplateFormDialog}
    resolve={{ call, refetch }}
    size="lg"
    formId="CallResourceTemplateForm"
    disabled={disabled}
    tooltip={tooltip}
  />
);
