import { set, unset } from 'lodash';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { flattenObject } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { updateOfferingIntegration } from '@waldur/marketplace/common/api';
import { Offering } from '@waldur/marketplace/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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

export const useUpdateOfferingIntegration = (offering: Offering, refetch?) => {
  const dispatch = useDispatch();
  const update = useCallback(
    async (formData) => {
      const payload = {
        service_attributes: offering.service_attributes,
        secret_options: offering.secret_options,
        plugin_options: offering.plugin_options,
        backend_id: offering.backend_id,
      };
      // Replace edited field(s)
      const flattenKeys = flattenObject(formData);
      Object.entries(flattenKeys).map(([key, value]) => {
        if (value || [0, false].includes(value)) {
          set(payload, key, value);
        } else {
          unset(payload, key);
        }
      });
      try {
        await updateOfferingIntegration(offering.uuid, payload);
        dispatch(
          showSuccess(translate('Offering has been updated successfully.')),
        );
        if (refetch) await refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to update offering.')),
        );
      }
    },
    [dispatch, offering, refetch],
  );

  return { update };
};
