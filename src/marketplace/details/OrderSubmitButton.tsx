import { ShoppingCartIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Button } from 'react-bootstrap';

import { parseDate } from '@waldur/core/dateUtils';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { removeEmptyObjects } from '@waldur/core/utils';
import { FieldErrorMessage } from '@waldur/form/FieldError';
import { FloatingButton } from '@waldur/form/FloatingButton';
import { translate } from '@waldur/i18n';

import { OrderSummaryProps } from './types';

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

  const errors = useMemo(
    () => removeEmptyObjects(props.errors),
    [props.errors],
  );

  const errorsExist =
    projectError ||
    errors?.attributes ||
    errors?.limits ||
    errors?.plan_entries;

  const Btn = (
    <Button
      variant="primary"
      disabled={Boolean(errorsExist) || !props.formValid || props.isSubmitting}
      type="submit"
      className="w-100"
    >
      {props.isSubmitting && <LoadingSpinnerIcon className="me-1" />}
      <span className="svg-icon svg-icon-2">
        <ShoppingCartIcon />
      </span>
      {translate('Create')}
    </Button>
  );

  return (
    <FloatingButton>
      {errorsExist ? (
        <Tip
          label={<FieldErrorMessage error={projectError || errors} />}
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
