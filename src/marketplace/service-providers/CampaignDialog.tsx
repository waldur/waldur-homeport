import { CaretRightIcon, PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { useState, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  CampaignRequest,
  DiscountTypeEnum,
  promotionsCampaignsCreate,
  promotionsCampaignsUpdate,
} from 'waldur-js-client';

import { required, requiredArray } from '@/core/validators';
import { NumberField, SelectField, StringField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { DateField } from '@/form/DateField';
import { FormContainer } from '@/form/FormContainer';
import { AsyncSelectField } from '@/form/select/AsyncSelectField';
import { translate } from '@/i18n';
import * as api from '@/marketplace/common/api';
import { providerOfferingsAutocomplete } from '@/marketplace/common/autocompletes';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';
import { ProgressStep, WizardStepIndicator } from '@/wizard';
import { useCustomer } from '@/workspace/hooks';

import { CampaignFormData } from './types';

const steps: ProgressStep[] = [
  { key: 'type', label: translate('Select type'), completed: false },
  {
    key: 'actions',
    label: translate('Actions'),
    completed: false,
  },
];

export const CampaignDialog = ({
  resolve,
}: {
  resolve: { campaign?: CampaignFormData; refetch?; fetch? };
}) => {
  const [step, setStep] = useState(0);
  const { showErrorResponse } = useNotify();
  const customer = useCustomer();
  const isUpdate = Boolean(resolve.campaign?.uuid);

  const getServiceProvider = async () => {
    try {
      return await api.getServiceProviderByCustomer({
        customer_uuid: customer.uuid,
      });
    } catch (e) {
      showErrorResponse(e, translate('Unable to load service provider.'));
      throw e;
    }
  };

  const loadOfferings = useMemo(
    () =>
      providerOfferingsAutocomplete({ shared: true, customer: customer.url }),
    [customer.url],
  );

  const mutation = useManagedMutation<any, any, CampaignFormData>({
    mutationFn: async (formData) => {
      const service_provider = await getServiceProvider();
      const body: CampaignRequest = {
        name: formData.name,
        discount_type: formData.discount_type as DiscountTypeEnum,
        discount: formData.discount,
        start_date: formData.start_date,
        end_date: formData.end_date,
        stock: formData.stock,
        auto_apply: formData.auto_apply,
        service_provider: service_provider.url,
        offerings: formData.offerings.map((offering) => offering.uuid),
      };
      return isUpdate
        ? promotionsCampaignsUpdate({
            path: { uuid: resolve.campaign.uuid },
            body,
          })
        : promotionsCampaignsCreate({ body });
    },
    successMessage: isUpdate
      ? translate('Campaign has been updated.')
      : translate('Campaign has been created.'),
    errorMessage: isUpdate
      ? translate('Unable to update a campaign.')
      : translate('Unable to create a campaign.'),
    refetch: resolve.fetch || resolve.refetch,
  });

  return (
    <Form<CampaignFormData>
      onSubmit={(values) => mutation.mutateAsync(values)}
      initialValues={resolve.campaign}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isUpdate
                ? translate('Update a campaign')
                : translate('Create a campaign')
            }
            footer={
              step === 0 ? (
                <ActionButton
                  action={() => setStep(1)}
                  disabled={invalid || submitting}
                  disabledReason={translate(
                    'Please fill in the required fields',
                  )}
                  title={translate('Continue')}
                  iconNode={<CaretRightIcon weight="bold" />}
                  iconRight
                  variant="primary"
                />
              ) : (
                <ActionButton
                  disabled={invalid || submitting}
                  disabledReason={translate(
                    'Please fill in the required fields',
                  )}
                  action={handleSubmit}
                  iconNode={<PaperPlaneTiltIcon weight="bold" />}
                  title={
                    isUpdate
                      ? translate('Update a campaign')
                      : translate('Create a campaign')
                  }
                  variant="primary"
                />
              )
            }
          >
            <div className="mb-7">
              <WizardStepIndicator
                steps={steps}
                value={steps[step]}
                onClick={(_, i) =>
                  i > step && (invalid || submitting) ? null : setStep(i)
                }
              />
            </div>

            {step === 0 ? (
              <FormContainer submitting={submitting} className="size-lg">
                <StringField
                  name="name"
                  label={translate('Campaign name')}
                  required
                  validate={required}
                />

                <SelectField
                  name="discount_type"
                  label={translate('Discount type')}
                  required
                  simpleValue
                  options={[
                    { label: translate('Discount'), value: 'discount' },
                    {
                      label: translate('Special price'),
                      value: 'special_price',
                    },
                  ]}
                  validate={required}
                />

                <DateField
                  name="start_date"
                  label={translate('Campaign start date')}
                  required
                  validate={required}
                />

                <DateField
                  name="end_date"
                  label={translate('Campaign end date')}
                  required
                  validate={required}
                />

                <AsyncSelectField
                  name="offerings"
                  label={translate('Offerings')}
                  placeholder={translate('Select offerings...')}
                  loadOptions={loadOfferings}
                  getOptionValue={(option) => option.uuid}
                  getOptionLabel={(option) => option.name}
                  isMulti
                  required
                  validate={requiredArray}
                />
              </FormContainer>
            ) : (
              <FormContainer submitting={submitting} className="size-lg">
                <NumberField
                  name="discount"
                  label={translate('Discount')}
                  required
                  validate={required}
                  min={0}
                />

                <NumberField name="stock" label={translate('Stock')} min={0} />
                <AwesomeCheckboxField
                  name="auto_apply"
                  label={translate('Auto apply')}
                  hideLabel
                />
              </FormContainer>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
