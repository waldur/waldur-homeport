import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import {
  marketplaceOfferingEstimatedCostPoliciesDestroy,
  marketplaceOfferingUsagePoliciesDestroy,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse } from '@/store/notify';

import { OfferingPolicyType } from './types';

export const PolicyDeleteAction = ({
  row,
  type,
  refetch,
}: {
  row;
  type: OfferingPolicyType;
  refetch;
}) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the policy for offering {name}?',
          { name: <strong>{row.scope_name}</strong> },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      if (type === 'usage') {
        await marketplaceOfferingUsagePoliciesDestroy({
          path: { uuid: row.uuid },
        });
      } else {
        await marketplaceOfferingEstimatedCostPoliciesDestroy({
          path: { uuid: row.uuid },
        });
      }
      refetch();
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to delete policy.')));
    }
  };
  return (
    <ActionItem
      title={translate('Remove')}
      action={openDialog}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
    />
  );
};
