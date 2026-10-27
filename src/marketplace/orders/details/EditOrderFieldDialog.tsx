import { Field, Form as FinalForm } from 'react-final-form';
import {
  marketplaceOrdersUpdate,
  OrderDetails,
  OrderUpdateRequest,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { BaseButton, FormField, FormLabel, Switch } from 'waldur-ui';

import { composeValidators } from '@/core/validators';
import { DateField } from '@/form/DateField';
import { BaseInputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { formatIntField, parseIntField } from '@/marketplace/common/utils';
import { useOrderStartDateBounds } from '@/marketplace/deploy/steps/useOrderStartDateBounds';
import { getOfferingComponentValidator } from '@/marketplace/offerings/store/limits';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface EditOrderFieldDialogProps {
  resolve: {
    order: OrderDetails;
    offering: Pick<PublicOfferingDetails, 'components'>;
    name: 'start_date' | 'limits';
    component?: string;
    selectedComponents?: string[];
  };
  initialValues?: any;
}

const LimitInput = (
  props: { input: any; meta: any } & {
    min?: number;
    max?: number;
    unit?: string;
  },
) => (
  <BaseInputField
    type="number"
    min={props.min}
    max={props.max}
    end={props.unit}
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

  const isBulkLimits = resolve.name === 'limits' && !resolve.component;

  const componentsToEdit = isBulkLimits
    ? resolve.selectedComponents?.length
      ? resolve.offering.components.filter((c) =>
          resolve.selectedComponents.includes(c.type),
        )
      : resolve.offering.components
    : [];

  const dateFieldProps = useOrderStartDateBounds(undefined);

  const renderComponentField = (c) =>
    c.is_boolean ? (
      <Field
        name={`limits.${c.type}`}
        render={(fieldProps) => (
          <Switch
            label={c.name}
            checked={fieldProps.input.value === 1}
            onCheckedChange={(value) =>
              fieldProps.input.onChange(value ? 1 : 0)
            }
          />
        )}
      />
    ) : (
      <FormField className="mb-3" key={c.type}>
        <FormLabel>
          {c.name}
          {c.measured_unit ? ` (${c.measured_unit})` : null}
        </FormLabel>
        <Field
          name={`limits.${c.type}`}
          parse={parseIntField}
          format={formatIntField}
          validate={composeValidators(...getOfferingComponentValidator(c))}
        >
          {({ input, meta }) => (
            <LimitInput
              input={input}
              meta={meta}
              min={c.min_value || 0}
              max={c.max_value}
              unit={c.measured_unit}
            />
          )}
        </Field>
      </FormField>
    );

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
                : isBulkLimits
                  ? translate('Edit limits')
                  : component
                    ? translate('Edit {name}', { name: component.name })
                    : translate('Edit plan details')
            }
            subtitle={
              <ScopeSubtitle
                label={translate('Resource name')}
                name={resolve.order.resource_name}
              />
            }
            footer={
              <>
                <CloseDialogButton className="flex-1" />
                <BaseButton
                  variant="primary"
                  className="flex-1"
                  label={translate('Save')}
                  onClick={handleSubmit}
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
              <Field name="start_date">
                {({ input, meta }) => (
                  <DateField
                    input={input}
                    meta={meta}
                    label={translate('Start date')}
                    {...dateFieldProps}
                  />
                )}
              </Field>
            ) : isBulkLimits ? (
              <>
                {componentsToEdit.map((c) => (
                  <div key={c.type}>{renderComponentField(c)}</div>
                ))}
              </>
            ) : resolve.name === 'limits' && component ? (
              <FormField>{renderComponentField(component)}</FormField>
            ) : null}
          </ModalDialog>
        </form>
      )}
    />
  );
};
