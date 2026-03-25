import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { Field, Form as FinalForm } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  marketplaceOrdersUpdate,
  OrderDetails,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { composeValidators } from '@waldur/core/validators';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import {
  formatIntField,
  parseIntField,
} from '@waldur/marketplace/common/utils';
import { useOrderStartDateBounds } from '@waldur/marketplace/deploy/steps/OrderStartDateField';
import { getOfferingComponentValidator } from '@waldur/marketplace/offerings/store/limits';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';
import { ActionButton } from '@waldur/table/ActionButton';

interface EditOrderFieldDialogProps {
  resolve: {
    order: OrderDetails;
    offering: PublicOfferingDetails;
    name: 'start_date' | 'limits';
    component?: string;
  };
  initialValues?: any;
}

const LimitInput = (
  props: { input: any; meta: any } & {
    min?: number;
    max?: number;
    unit?: string;
  },
) =>
  props.unit ? (
    <InputGroup>
      <Form.Control
        type="number"
        min={props.min}
        max={props.max}
        {...props.input}
      />
      <InputGroup.Text>{props.unit}</InputGroup.Text>
    </InputGroup>
  ) : (
    <Form.Control
      type="number"
      min={props.min}
      max={props.max}
      {...props.input}
    />
  );

export const EditOrderFieldDialog = (props: EditOrderFieldDialogProps) => {
  const { resolve } = props;
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();

  const queryClient = useQueryClient();

  const onSubmit = useCallback(
    async (formData) => {
      try {
        const payload: any = {};
        if (resolve.name === 'start_date') {
          payload.start_date = formData.start_date;
        } else if (resolve.name === 'limits') {
          payload.limits = formData.limits;
        }
        await marketplaceOrdersUpdate({
          path: { uuid: resolve.order.uuid },
          body: payload,
        });
        await queryClient.invalidateQueries({
          queryKey: ['OrderDetails', resolve.order.uuid],
        });
        dispatch(showSuccess(translate('Order has been updated.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to update order.')));
      }
    },
    [resolve, dispatch, showSuccess, showErrorResponse, queryClient],
  );

  const component = resolve.component
    ? resolve.offering.components.find((c) => c.type === resolve.component)
    : undefined;

  const dateFieldProps = useOrderStartDateBounds(undefined);

  return (
    <FinalForm
      onSubmit={onSubmit}
      initialValues={props.initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              resolve.name === 'start_date'
                ? translate('Edit start date')
                : component
                  ? translate('Edit {name}', { name: component.name })
                  : translate('Edit plan details')
            }
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <ActionButton
                  className="btn btn-primary flex-equal"
                  title={translate('Save')}
                  action={handleSubmit}
                  disabled={invalid || submitting}
                  disabledReason={
                    submitting
                      ? translate('Please wait...')
                      : translate('Please fill in the required fields')
                  }
                />
              </>
            }
          >
            {resolve.name === 'start_date' ? (
              <Field
                name="start_date"
                label={translate('Start date')}
                component={DateField}
                {...dateFieldProps}
              />
            ) : resolve.name === 'limits' && component ? (
              <Form.Group>
                {component.is_boolean ? (
                  <Field
                    name={`limits.${component.type}`}
                    render={(fieldProps) => (
                      <AwesomeCheckbox
                        label={translate('Enable')}
                        value={fieldProps.input.value === 1}
                        onChange={(value) =>
                          fieldProps.input.onChange(value ? 1 : 0)
                        }
                      />
                    )}
                  />
                ) : (
                  <Field
                    name={`limits.${component.type}`}
                    parse={parseIntField}
                    format={formatIntField}
                    validate={composeValidators(
                      ...getOfferingComponentValidator(component),
                    )}
                    component={LimitInput}
                    min={component.min_value || 0}
                    max={component.max_value}
                    unit={component.measured_unit}
                  />
                )}
              </Form.Group>
            ) : null}
          </ModalDialog>
        </form>
      )}
    />
  );
};
