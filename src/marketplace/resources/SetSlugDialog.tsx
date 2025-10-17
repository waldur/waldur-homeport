import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceResourcesSetSlug } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
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
          help_text: translate(
            'Warning: Changing the slug may break external integrations that rely on this value. Ensure that all dependent systems are updated before proceeding.',
          ),
        },
      ]}
      initialValues={{
        slug: resource.slug,
      }}
      submitForm={async (formData) => {
        try {
          await marketplaceResourcesSetSlug({
            path: { uuid: resource.uuid },
            body: formData,
          });
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
