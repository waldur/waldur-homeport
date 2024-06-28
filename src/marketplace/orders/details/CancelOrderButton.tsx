import { Prohibit } from '@phosphor-icons/react';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { cancelOrder } from '@waldur/marketplace/common/api';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

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
    <>
      {loading ? (
        <LoadingSpinnerIcon className="me-1" />
      ) : (
        <ActionItem
          className="text-danger"
          title={translate('Cancel')}
          action={callback}
          disabled={loading}
          iconNode={<Prohibit />}
        />
      )}
    </>
  );
};
