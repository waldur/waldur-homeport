import { CaretRightIcon, PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';
import {
  promotionsCampaignsCreate,
  promotionsCampaignsUpdate,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import * as api from '@/marketplace/common/api';
import { serializeCampaign } from '@/marketplace/service-providers/utils';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';
import { getCustomer } from '@/workspace/selectors';

import { CampaignFormData } from './types';

export const CampaignFooter = ({
  step,
  setStep,
  handleSubmit,
  disabled,
  refetch,
  isUpdate,
}: {
  step;
  setStep;
  handleSubmit;
  disabled;
  refetch;
  isUpdate?;
}) => {
  const { showErrorResponse } = useNotify();

  const customer = useSelector(getCustomer);
  async function getServiceProvider() {
    try {
      return await api.getServiceProviderByCustomer({
        customer_uuid: customer.uuid,
      });
    } catch (e) {
      showErrorResponse(e, translate('Unable to load service provider.'));
    }
  }

  const createMutation = useManagedMutation<any, any, CampaignFormData>({
    mutationFn: async (formData) => {
      formData.service_provider = await getServiceProvider();
      return promotionsCampaignsCreate({ body: serializeCampaign(formData) });
    },
    successMessage: translate('Campaign has been created.'),
    errorMessage: translate('Unable to create a campaign.'),
    refetch,
  });

  const updateMutation = useManagedMutation<any, any, CampaignFormData>({
    mutationFn: async (formData) => {
      formData.service_provider = await getServiceProvider();
      return promotionsCampaignsUpdate({
        path: { uuid: formData.uuid },
        body: serializeCampaign(formData),
      });
    },
    successMessage: translate('Campaign has been updated.'),
    errorMessage: translate('Unable to update a campaign.'),
    refetch,
  });

  return step === 0 ? (
    <ActionButton
      action={() => setStep(1)}
      disabled={disabled}
      disabledReason={translate('Please fill in the required fields')}
      title={translate('Continue')}
      iconNode={<CaretRightIcon weight="bold" />}
      iconRight
      variant="primary"
    />
  ) : (
    <>
      {!isUpdate ? (
        <ActionButton
          disabled={disabled}
          disabledReason={translate('Please fill in the required fields')}
          action={handleSubmit(createMutation.mutateAsync)}
          iconNode={<PaperPlaneTiltIcon weight="bold" />}
          title={translate('Create a campaign')}
          variant="primary"
        />
      ) : (
        <ActionButton
          disabled={disabled}
          disabledReason={translate('Please fill in the required fields')}
          action={handleSubmit(updateMutation.mutateAsync)}
          iconNode={<PaperPlaneTiltIcon weight="bold" />}
          title={translate('Update a campaign')}
          variant="primary"
        />
      )}
    </>
  );
};
