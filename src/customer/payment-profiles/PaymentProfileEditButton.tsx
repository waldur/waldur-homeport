import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

const PaymentProfileUpdateDialogContainer = lazyComponent(
  () => import('./PaymentProfileUpdateDialog'),
  'PaymentProfileUpdateDialogContainer',
);

export const PaymentProfileEditButton = (props) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(PaymentProfileUpdateDialogContainer, {
        resolve: { profile: props.profile, refetch: props.refetch },
      }),
    );

  return (
    <EditButton
      onClick={callback}
      size="sm"
      {...props.tooltipAndDisabledAttributes}
    />
  );
};
