import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { cancelOrder } from '@waldur/marketplace/common/api';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

interface CancelOrderButtonProps {
  uuid: string;
  loadData(): void;
}

export const CancelOrderButton: FC<CancelOrderButtonProps> = (props) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const callback = async () => {
    setLoading(true);
    try {
      await cancelOrder(props.uuid);
      dispatch(showSuccess(translate('Order has been canceled.')));
      props.loadData();
    } catch (response) {
      dispatch(
        showErrorResponse(response, translate('Unable to cancel order.')),
      );
    }
    setLoading(false);
  };

  return (
    <ActionButton
      className="btn btn-sm btn-danger mb-2"
      title={translate('Cancel')}
      action={callback}
      disabled={loading}
      icon={loading ? 'fa fa-spinner fa-spin' : 'fa fa-trash'}
    />
  );
};
