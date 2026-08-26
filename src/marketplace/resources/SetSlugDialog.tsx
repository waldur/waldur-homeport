import { FC } from 'react';
import { marketplaceResourcesSetSlug } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const SetSlugDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<any, any, { slug: string }>({
    mutationFn: (formData) =>
      marketplaceResourcesSetSlug({
        path: { uuid: resource.uuid },
        body: formData,
      }),

    successMessage: translate('Slug has been successfully set.'),
    errorMessage: translate('Unable to set slug.'),
    refetch: refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Set slug')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Resource name')}
          name={resource.name}
        />
      }
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
      submitForm={mutation.mutateAsync}
    />
  );
};
