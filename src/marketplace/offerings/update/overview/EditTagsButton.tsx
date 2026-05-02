import { ProviderOfferingDetails } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

const EditTagsDialog = lazyComponent(() =>
  import('./EditTagsDialog').then((module) => ({
    default: module.EditTagsDialog,
  })),
);

interface EditTagsButtonProps {
  offering: ProviderOfferingDetails;
  refetch: () => void;
}

export const EditTagsButton = ({ offering, refetch }: EditTagsButtonProps) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditTagsDialog, {
      resolve: { offering, refetch },
      size: 'lg',
    });
  };
  return <CompactEditButton onClick={callback} variant="secondary" />;
};
