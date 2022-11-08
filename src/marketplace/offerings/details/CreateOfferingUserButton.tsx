import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const CreateOfferingUserDialog = lazyComponent(
  () => import('./CreateOfferingUserDialog'),
  'CreateOfferingUserDialog',
);

export const CreateOfferingUserButton = ({ offering, onSuccess }) => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      title={translate('Create')}
      icon="fa fa-plus"
      action={() =>
        dispatch(
          openModalDialog(CreateOfferingUserDialog, {
            resolve: { offering, onSuccess },
          }),
        )
      }
    />
  );
};
