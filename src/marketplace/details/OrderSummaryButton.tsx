import { EyeIcon } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

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
    <Button
      variant="secondary"
      className={className}
      onClick={() =>
        dispatch(openModalDialog(OrderSummaryDialog, { offering, size: 'sm' }))
      }
      disabled={disabled}
    >
      <span className="svg-icon svg-icon-2">
        <EyeIcon weight="bold" />
      </span>
      {label}
    </Button>
  );
};
