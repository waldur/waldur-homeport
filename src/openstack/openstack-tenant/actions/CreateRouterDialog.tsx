import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { openstackRoutersCreate, OpenStackTenant } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { createLatinNameField } from '@waldur/resource/actions/base';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

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
