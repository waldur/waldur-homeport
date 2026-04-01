import { useDispatch } from 'react-redux';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { CompactEditButton } from '@waldur/form/CompactEditButton';
import { openModalDialog } from '@waldur/modal/actions';

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
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditTagsDialog, {
        resolve: { offering, refetch },
        size: 'lg',
      }),
    );
  };
  return <CompactEditButton onClick={callback} variant="secondary" />;
};
