import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { openstackRoutersCreate, OpenStackTenant } from 'waldur-js-client';

import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { createLatinNameField } from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const CreateRouterDialog: FC<ActionDialogProps<OpenStackTenant>> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();

  const submitForm = useCallback(
    async (formData) => {
      try {
        await openstackRoutersCreate({
          body: {
            name: formData.name,
            tenant: resource.url,
          },
        });
        dispatch(showSuccess(translate('OpenStack router has been created.')));
        dispatch(closeModalDialog());
        if (refetch) {
          await refetch();
        }
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to create OpenStack router.')),
        );
      }
    },
    [dispatch, refetch],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create new router')}
      submitForm={submitForm}
      formFields={[createLatinNameField()]}
    />
  );
};
