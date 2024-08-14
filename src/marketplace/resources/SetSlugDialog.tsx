import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { setSlug } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const SetSlugDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Set slug')}
      formFields={[
        {
          name: 'slug',
          label: translate('Slug'),
          required: true,
          type: 'string',
        },
      ]}
      initialValues={{
        slug: resource.slug,
      }}
      submitForm={async (formData) => {
        try {
          await setSlug(resource.uuid, formData);
          dispatch(showSuccess(translate('Slug has been successfully set.')));
          if (refetch) {
            await refetch();
          }
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to set slug.')));
        }
      }}
    />
  );
};
