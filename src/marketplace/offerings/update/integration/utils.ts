import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { SubmissionError } from 'redux-form';
import {
  marketplaceProviderOfferingsUpdateIntegration,
  OfferingIntegrationUpdateRequest,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import {
  getPluginOptionsSerializer,
  getSecretOptionsSerializer,
} from '@waldur/marketplace/common/registry';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';

export const SCRIPT_ROWS = [
  { label: translate('Script language'), type: 'language' },
  {
    label: translate('Script for creation of a resource'),
    type: 'create',
    dry_run: 'Create',
  },
  {
    label: translate('Script for termination of a resource'),
    type: 'terminate',
    dry_run: 'Terminate',
  },
  {
    label: translate('Script for updating a resource on plan or limit change'),
    type: 'update',
    dry_run: 'Update',
  },
  {
    label: translate(
      'Script for regular update of resource and its accounting',
    ),
    type: 'pull',
    dry_run: 'Pull',
  },
];

export const useUpdateOfferingIntegration = (
  offering: ProviderOfferingDetails,
  refetch?,
) => {
  const dispatch = useDispatch();
  const update = useCallback(
    async (formData: OfferingIntegrationUpdateRequest) => {
      if (formData.plugin_options) {
        const serializer = getPluginOptionsSerializer(offering.type);
        if (serializer) {
          formData.plugin_options = serializer(formData.plugin_options);
        }
      }
      if (formData.secret_options) {
        const serializer = getSecretOptionsSerializer(offering.type);
        if (serializer) {
          formData.secret_options = serializer(formData.secret_options);
        }
      }
      try {
        await marketplaceProviderOfferingsUpdateIntegration({
          path: { uuid: offering.uuid },
          body: formData,
        });
        dispatch(
          showSuccess(translate('Offering has been updated successfully.')),
        );
        if (refetch) await refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(showError(translate('Unable to update offering.')));
        throw new SubmissionError(error);
      }
    },
    [dispatch, offering, refetch],
  );

  return { update };
};
