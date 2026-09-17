import { CheckIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
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
import {
  getHiddenOptionKeys,
  omitHiddenOptionValues,
} from '@/marketplace/common/optionVisibility';
import { OptionValue } from '@/marketplace/resources/options/OptionValue';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import {
  TABLE_MARKETPLACE_ORDERS,
  TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  TABLE_PENDING_PUBLIC_ORDERS,
  TABLE_PUBLIC_ORDERS,
} from '../list/constants';

import { OrderSummaryRows } from './OrderSummaryRows';

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
  hiddenKeys: ReadonlySet<string>;
}> = ({ optionKey, option, submittedValue, resourceOptions, hiddenKeys }) => {
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
    hiddenKeys,
    optionKey,
  );

  return (
    <tr>
      <td>{option?.label || optionKey}</td>
      <td className="text-muted">
        <OptionValue option={option} value={submittedValue} />
      </td>
      <td>
        <div style={option?.type === 'integer' ? { width: 96 } : undefined}>
          <Field
            name={`attributes.${optionKey}`}
            component={OptionField}
            validate={validateFn}
            {...params}
          />
        </div>
        <FormFieldError name={`attributes.${optionKey}`} />
      </td>
    </tr>
  );
};

/**
 * Options hidden by a visible_if rule for the values the resource would have
 * once the order is approved. The order carries no live copy of the resource
 * options, but `old_options` is the snapshot taken when the order was created,
 * and no other option change can happen while it is pending.
 */
const getApprovalHiddenKeys = (
  resourceOptions: any,
  currentOptions: Record<string, any>,
  newValues: Record<string, any> | undefined,
) =>
  getHiddenOptionKeys(resourceOptions?.options, {
    ...currentOptions,
    ...newValues,
  });

const SubmittedOptionRows: FC<{
  resourceOptions: any;
  currentOptions: Record<string, any>;
  userSubmittedOptions: Record<string, any>;
}> = ({ resourceOptions, currentOptions, userSubmittedOptions }) => {
  const { values } = useFormState({ subscription: { values: true } });
  const hiddenKeys = useMemo(
    () =>
      getApprovalHiddenKeys(
        resourceOptions,
        currentOptions,
        values?.attributes,
      ),
    [resourceOptions, currentOptions, values?.attributes],
  );
  return (
    <>
      {resourceOptions.order.map((key) => {
        const option = resourceOptions.options[key];
        const submittedValue = userSubmittedOptions[key];
        if (submittedValue === undefined || hiddenKeys.has(key)) return null;
        return (
          <OptionRow
            key={key}
            optionKey={key}
            option={option}
            submittedValue={submittedValue}
            resourceOptions={resourceOptions}
            hiddenKeys={hiddenKeys}
          />
        );
      })}
    </>
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
  const currentOptions = useMemo(
    () => orderAttributes?.old_options || {},
    [orderAttributes],
  );

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
      const newOptions = formData?.attributes
        ? omitHiddenOptionValues(
            resourceOptions?.options,
            formData.attributes,
            getApprovalHiddenKeys(
              resourceOptions,
              currentOptions,
              formData.attributes,
            ),
          )
        : undefined;
      if (newOptions && Object.keys(newOptions).length > 0) {
        body.attributes = { new_options: newOptions };
      }

      await marketplaceOrdersApproveByProvider({
        path: { uuid: resolve.order.uuid },
        body: Object.keys(body).length > 0 ? body : undefined,
      });
    },
    successMessage: translate('Order has been approved.'),
    errorMessage: translate('Unable to approve order.'),
    refetch: resolve.refetch,
    invalidateQueries: [
      { queryKey: ['table', TABLE_MARKETPLACE_ORDERS] },
      { queryKey: ['table', TABLE_PUBLIC_ORDERS] },
      { queryKey: ['table', TABLE_PENDING_PUBLIC_ORDERS] },
      { queryKey: ['table', TABLE_PENDING_PROVIDER_PUBLIC_ORDERS] },
      { queryKey: ['OrderDetails', resolve.order.uuid] },
    ],
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
            <OrderSummaryRows order={resolve.order} />
            {offeringQuery.isLoading ? (
              <LoadingSpinner />
            ) : offeringQuery.error ? (
              <LoadingErred loadData={offeringQuery.refetch} className="mb-4" />
            ) : hasOptions ? (
              <>
                {hasUserSubmittedOptions ? (
                  // Rounding lives on the outer box so its `overflow-hidden`
                  // cannot override `table-responsive`'s horizontal scroll.
                  <div className="border rounded overflow-hidden">
                    <div className="table-responsive">
                      <table className="table table-sm table-row-bordered mb-0 align-middle">
                        <thead>
                          <tr>
                            <th>{translate('Option')}</th>
                            <th>{translate('Submitted value')}</th>
                            {/* Shrink to the field it holds instead of taking
                                the table's remaining width. */}
                            <th style={{ width: '1%' }}>
                              {translate('New value')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <SubmittedOptionRows
                            resourceOptions={resourceOptions}
                            currentOptions={currentOptions}
                            userSubmittedOptions={userSubmittedOptions}
                          />
                        </tbody>
                      </table>
                    </div>
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
