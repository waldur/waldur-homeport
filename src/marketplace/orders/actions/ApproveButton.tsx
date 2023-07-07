import { useMutation } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { approveOrder } from '@waldur/marketplace/common/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { wrapTooltip } from '@waldur/table/ActionButton';

export const ApproveButton: FunctionComponent<{ orderId: string; refetch? }> =
  ({ orderId, refetch }) => {
    const dispatch = useDispatch();
    const { mutate, isLoading } = useMutation(async () => {
      try {
        await approveOrder(orderId);
        if (refetch) {
          await refetch();
        }
        dispatch(showSuccess(translate('Order has been approved.')));
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to approve order.')),
        );
      }
    });
    return wrapTooltip(
      translate('You need approval to finish purchasing of services.'),
      <button
        type="button"
        className="btn btn-primary btn-sm me-1"
        onClick={() => mutate()}
        disabled={isLoading}
      >
        <i className="fa fa-check" /> {translate('Approve')}{' '}
        {isLoading && <i className="fa fa-spinner fa-spin me-1" />}
      </button>,
    );
  };
