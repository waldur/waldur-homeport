import { ShoppingCartIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';

import { parseDate } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { removeEmptyObjects } from '@/core/utils';
import { SubmitButton } from '@/form';
import { FieldErrorMessage } from '@/form/FieldError';
import { FloatingButton } from '@/form/FloatingButton';
import { translate } from '@/i18n';

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
    <SubmitButton
      submitting={props.isSubmitting}
      disabled={Boolean(errorsExist) || !props.formValid || props.isSubmitting}
      type="submit"
      className="w-100"
      label={translate('Create')}
      iconNode={<ShoppingCartIcon weight="bold" />}
      iconOnLeft
    />
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
