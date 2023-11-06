import { useCallback } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { serializeCampaign } from '@waldur/marketplace/service-providers/utils';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

import { createCampaign, updateCampaign } from './api';
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
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  async function getServiceProvider() {
    try {
      return await api.getServiceProviderByCustomer({
        customer_uuid: customer.uuid,
      });
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to load service provider.')),
      );
    }
  }

  const saveAndSend = useCallback(
    async (formData: CampaignFormData) => {
      try {
        formData.service_provider = await getServiceProvider();
        await createCampaign(serializeCampaign(formData));
        refetch();
        dispatch(showSuccess(translate('Campaign has been created.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to create a campaign.')),
        );
      }
    },
    [dispatch],
  );

  const saveAndUpdate = useCallback(
    async (formData: CampaignFormData) => {
      try {
        formData.service_provider = await getServiceProvider();
        await updateCampaign(formData.uuid, serializeCampaign(formData));
        refetch();
        dispatch(showSuccess(translate('Campaign has been updated.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to update a campaign.')),
        );
      }
    },
    [dispatch],
  );

  return (
    <Modal.Footer>
      {step === 0 ? (
        <Button onClick={() => setStep(1)} className="ms-3">
          <i className="fa fa-long-arrow-right" /> {translate('Continue')}
        </Button>
      ) : (
        <>
          {!isUpdate ? (
            <Button
              disabled={disabled}
              className="ms-3"
              onClick={handleSubmit(saveAndSend)}
            >
              <i className="fa fa-send" /> {translate('Create a campaign')}
            </Button>
          ) : (
            <Button
              disabled={disabled}
              className="ms-3"
              onClick={handleSubmit(saveAndUpdate)}
            >
              <i className="fa fa-send" /> {translate('Update a campaign')}
            </Button>
          )}
        </>
      )}
    </Modal.Footer>
  );
};
