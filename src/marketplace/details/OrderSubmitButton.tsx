import { ShoppingCart } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { triggerTransition } from '@uirouter/redux';
import { useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { parseDate } from '@waldur/core/dateUtils';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { FieldError } from '@waldur/form';
import { FloatingButton } from '@waldur/form/FloatingButton';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { createOrder } from '../common/api';

import { OrderSummaryProps } from './types';
import { formatOrderForCreate } from './utils';

export const OrderSubmitButton = (props: OrderSummaryProps) => {
  const projectError = useMemo(() => {
    if (props.formData?.project?.end_date) {
      const endDate = parseDate(props.formData.project.end_date);
      const now = parseDate(null);
      if (endDate.hasSame(now, 'day') || endDate < now) {
        return translate('Project has reached its end date.');
      }
    }
    return null;
  }, [props.formData?.project]);

  const errorsExist =
    projectError || props.errors?.attributes || props.errors?.limits;

  const dispatch = useDispatch();
  const { mutate, isLoading } = useMutation(async () => {
    await waitForConfirmation(
      dispatch,
      translate('Confirmation'),
      translate('Are you sure you want to submit the order?'),
    );
    try {
      const order: any = await createOrder(formatOrderForCreate(props));
      dispatch(showSuccess(translate('Order has been submitted.')));
      dispatch(
        triggerTransition('marketplace-resource-details', {
          resource_uuid: order.data.marketplace_resource_uuid,
        }),
      );
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to submit order.')));
    }
  });

  const Btn = (
    <Button
      size="sm"
      variant="primary"
      disabled={Boolean(errorsExist) || !props.formValid || isLoading}
      onClick={() => mutate()}
      className="w-100"
    >
      {isLoading && <LoadingSpinnerIcon className="me-1" />}
      <span className="svg-icon svg-icon-2">
        <ShoppingCart />
      </span>
      {translate('Create')}
    </Button>
  );

  return (
    <FloatingButton>
      {errorsExist ? (
        <Tip
          label={
            <FieldError
              error={
                projectError || {
                  ...props.errors?.attributes,
                  ...props.errors?.limits,
                }
              }
            />
          }
          id="offering-button-errors"
          autoWidth
          className="w-100"
        >
          {Btn}
        </Tip>
      ) : (
        Btn
      )}
    </FloatingButton>
  );
};
