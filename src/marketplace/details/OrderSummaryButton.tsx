import { EyeIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const OrderSummaryDialog = lazyComponent(() =>
  import('./OrderSummaryDialog').then((module) => ({
    default: module.OrderSummaryDialog,
  })),
);

export const OrderSummaryButton = ({
  offering,
  label = translate('View summary'),
  className = undefined,
  disabled = false,
}) => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      variant="tertiary"
      className={className}
      action={() =>
        dispatch(openModalDialog(OrderSummaryDialog, { offering, size: 'sm' }))
      }
      disabled={disabled}
      title={label}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};
