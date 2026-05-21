import { CheckIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Field, Form, useFormState } from 'react-final-form';
import {
  marketplaceOrdersApproveByProvider,
  marketplaceOrdersOfferingRetrieve,
  OrderDetails,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { FormFieldError } from '@/form/FormFieldError';
import { translate } from '@/i18n';
import {
  buildOptionValidator,
  getComponentAndParams,
  OptionsForm,
} from '@/marketplace/common/OptionsForm';
import { OptionValue } from '@/marketplace/resources/options/OptionValue';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface ApproveByProviderDialogProps {
  resolve: {
    order: OrderDetails;
    refetch?: () => void;
  };
}

/** Renders inline option row with submitted value and editable new value */
const OptionRow: FC<{
  optionKey: string;
  option: any;
  submittedValue: any;
  resourceOptions: any;
}> = ({ optionKey, option, submittedValue, resourceOptions }) => {
  const { values } = useFormState({ subscription: { values: true } });
  const { OptionField, params } = getComponentAndParams(
    option,
    optionKey,
    null,
  );
  const validateFn = buildOptionValidator(
    option,
    resourceOptions,
    values,
    params.validate,
  );

  return (
    <tr>
      <td>{option?.label || optionKey}</td>
      <td className="text-muted">
        <OptionValue option={option} value={submittedValue} />
      </td>
      <td>
        <Field
          name={`attributes.${optionKey}`}
          component={OptionField}
          validate={validateFn}
          {...params}
        />
        <FormFieldError name={`attributes.${optionKey}`} />
      </td>
    </tr>
  );
};

export const ApproveByProviderDialog: FC<ApproveByProviderDialogProps> = ({
  resolve,
}) => {
  // Determine if this order type supports options update
  const orderAttributes = resolve.order.attributes as Record<string, any>;
  const isOptionsUpdateOrder =
    resolve.order.type === 'Create' ||
    (resolve.order.type === 'Update' &&
      typeof orderAttributes?.new_options === 'object');

  // User-submitted options (from Update orders)
  const userSubmittedOptions =
    orderAttributes?.new_options || orderAttributes.options || {};

  // Fetch offering to get resource_options (only if order supports options)
  const offeringQuery = useQuery({
    queryKey: ['order-offering-options', resolve.order.uuid],
    queryFn: () =>
      marketplaceOrdersOfferingRetrieve({
        path: { uuid: resolve.order.uuid },
      }).then((response) => response.data),
    staleTime: UI_STALE_TIME,
    enabled: isOptionsUpdateOrder,
  });

  const resourceOptions = offeringQuery.data?.resource_options;
  const hasOptions =
    isOptionsUpdateOrder && Boolean(resourceOptions?.order?.length);

  const approveOrderMutation = useManagedMutation<
    any,
    any,
    { attributes?: Record<string, any> }
  >({
    mutationFn: async (formData) => {
      const body: { attributes?: { new_options?: Record<string, any> } } = {};
      if (formData?.attributes && Object.keys(formData.attributes).length > 0) {
        body.attributes = { new_options: formData.attributes };
      }

      await marketplaceOrdersApproveByProvider({
        path: { uuid: resolve.order.uuid },
        body: Object.keys(body).length > 0 ? body : undefined,
      });
    },
    successMessage: translate('Order has been approved.'),
    errorMessage: translate('Unable to approve order.'),
    refetch: resolve.refetch,
  });

  const handleSubmit = (formData: { attributes?: Record<string, any> }) => {
    approveOrderMutation.mutate(formData);
  };

  const hasUserSubmittedOptions = Object.keys(userSubmittedOptions).length > 0;

  return (
    <Form
      onSubmit={handleSubmit}
      initialValues={
        hasUserSubmittedOptions ? { attributes: userSubmittedOptions } : {}
      }
    >
      {({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Approve order')}
            iconNode={<CheckIcon weight="bold" />}
            iconColor="success"
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  disabled={offeringQuery.isLoading || !!offeringQuery.error}
                  submitting={submitting || approveOrderMutation.isPending}
                  label={translate('Approve')}
                />
              </>
            }
          >
            {offeringQuery.isLoading ? (
              <LoadingSpinner />
            ) : offeringQuery.error ? (
              <LoadingErred loadData={offeringQuery.refetch} className="mb-4" />
            ) : hasOptions ? (
              <>
                {hasUserSubmittedOptions ? (
                  <div className="table-responsive">
                    <table className="table table-row-bordered mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>{translate('Option')}</th>
                          <th>{translate('Submitted value')}</th>
                          <th>{translate('New value')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resourceOptions.order.map((key) => {
                          const option = resourceOptions.options[key];
                          const submittedValue = userSubmittedOptions[key];
                          if (submittedValue === undefined) return null;
                          return (
                            <OptionRow
                              key={key}
                              optionKey={key}
                              option={option}
                              submittedValue={submittedValue}
                              resourceOptions={resourceOptions}
                            />
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <OptionsForm options={resourceOptions} />
                )}
              </>
            ) : (
              <p>{translate('Are you sure you want to approve this order?')}</p>
            )}
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
