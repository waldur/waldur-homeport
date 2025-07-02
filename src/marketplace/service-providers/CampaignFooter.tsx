import { CaretRightIcon, PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import {
  promotionsCampaignsCreate,
  promotionsCampaignsUpdate,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { serializeCampaign } from '@waldur/marketplace/service-providers/utils';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

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
        await promotionsCampaignsCreate({ body: serializeCampaign(formData) });
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
        await promotionsCampaignsUpdate({
          path: { uuid: formData.uuid },
          body: serializeCampaign(formData),
        });
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
    <Modal.Footer className="border-0 pt-0 gap-2">
      {step === 0 ? (
        <Button onClick={() => setStep(1)}>
          <span className="svg-icon svg-icon-2">
            <CaretRightIcon weight="bold" />
          </span>{' '}
          {translate('Continue')}
        </Button>
      ) : (
        <>
          {!isUpdate ? (
            <Button disabled={disabled} onClick={handleSubmit(saveAndSend)}>
              <span className="svg-icon svg-icon-2">
                <PaperPlaneTiltIcon weight="bold" />
              </span>{' '}
              {translate('Create a campaign')}
            </Button>
          ) : (
            <Button disabled={disabled} onClick={handleSubmit(saveAndUpdate)}>
              <span className="svg-icon svg-icon-2">
                <PaperPlaneTiltIcon weight="bold" />
              </span>{' '}
              {translate('Update a campaign')}
            </Button>
          )}
        </>
      )}
    </Modal.Footer>
  );
};
