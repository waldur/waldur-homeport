import { Form, InputGroup } from 'react-bootstrap';
import { Field, Form as FinalForm } from 'react-final-form';
import {
  marketplaceOrdersUpdate,
  OrderDetails,
  OrderUpdateRequest,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { composeValidators } from '@/core/validators';
import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';
import { formatIntField, parseIntField } from '@/marketplace/common/utils';
import { useOrderStartDateBounds } from '@/marketplace/deploy/steps/OrderStartDateField';
import { getOfferingComponentValidator } from '@/marketplace/offerings/store/limits';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';

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

  const updateMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
      const payload: OrderUpdateRequest = {};
      if (resolve.name === 'start_date') {
        payload.start_date = formData.start_date;
      } else if (resolve.name === 'limits') {
        payload.limits = formData.limits;
      }
      return marketplaceOrdersUpdate({
        path: { uuid: resolve.order.uuid },
        body: payload,
      });
    },

    successMessage: translate('Order has been updated.'),
    errorMessage: translate('Unable to update order.'),

    invalidateQueries: [
      {
        queryKey: ['OrderDetails', resolve.order.uuid],
      },
    ],
  });

  const component = resolve.component
    ? resolve.offering.components.find((c) => c.type === resolve.component)
    : undefined;

  const dateFieldProps = useOrderStartDateBounds(undefined);

  return (
    <FinalForm
      onSubmit={(values) => updateMutation.mutateAsync(values)}
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
