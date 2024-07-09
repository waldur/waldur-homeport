import { PencilSimple } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

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
    <RowActionButton
      title={translate('Edit')}
      action={callback}
      iconNode={<PencilSimple />}
      size="sm"
      {...props.tooltipAndDisabledAttributes}
    />
  );
};
