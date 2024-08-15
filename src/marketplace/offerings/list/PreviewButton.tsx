import { Eye } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const PreviewOfferingDialog = lazyComponent(
  () => import('./PreviewOfferingDialog'),
  'PreviewOfferingDialog',
);

export const PreviewButton = ({ offering }) => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      title={translate('Preview order form')}
      iconNode={<Eye weight="bold" />}
      action={() =>
        dispatch(
          openModalDialog(PreviewOfferingDialog, {
            resolve: { offering },
            size: 'lg',
          }),
        )
      }
    />
  );
};
