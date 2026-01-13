import { CheckIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceUserOfferingConsentsCreate } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const AcceptTosAction = ({ tos, offering, refetch }) => {
  const dispatch = useDispatch();

  const callback = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Accept ToS'),
        translate(
          'Are you sure you want to accept the Terms of Service version {version} for {offeringName}?',
          {
            version: tos.version || 'v1.0',
            offeringName: offering.name,
          },
        ),
      );
    } catch {
      return;
    }

    try {
      await marketplaceUserOfferingConsentsCreate({
        body: {
          offering: offering.uuid,
        },
      });

      await refetch();
      dispatch(
        showSuccess(
          translate('Terms of Service has been accepted successfully.'),
        ),
      );
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to accept Terms of Service.'),
        ),
      );
    }
  }, [dispatch, tos.version, offering.uuid, offering.name, refetch]);

  return (
    <ActionItem
      title={translate('Accept')}
      action={callback}
      iconNode={<CheckIcon weight="bold" />}
      iconColor="success"
    />
  );
};
