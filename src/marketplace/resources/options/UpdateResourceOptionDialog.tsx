import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceResourcesUpdateOptions,
  OptionField,
  Resource,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { OptionsForm } from '@/marketplace/common/OptionsForm';
import { Offering } from '@/marketplace/types';
import { ActionDialogFinal } from '@/modal/ActionDialogFinal';
import { useManagedMutation } from '@/modal/useManagedMutation';

export interface UpdateResourceOptionDialogProps {
  resolve: {
    resource: Resource;
    offering: Offering;
    option: OptionField & { name: string };
    refetch?;
  };
}

export const UpdateResourceOptionDialog: FC<UpdateResourceOptionDialogProps> = (
  props,
) => {
  const { name, ...option } = props.resolve.option;
  const options = useMemo(() => {
    return {
      options: { [name]: { ...option, required: false } },
      order: [name],
    };
  }, [name, option]);

  const initialValues = useMemo(
    () => ({
      attributes: {
        [name]:
          props.resolve.resource && props.resolve.resource.options
            ? props.resolve.resource.options[name]
            : null,
      },
    }),
    [name, props.resolve.resource],
  );

  const updateMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplaceResourcesUpdateOptions({
        path: { uuid: props.resolve.resource.uuid },
        body: {
          options: formData.attributes,
        },
      }),
    successMessage: translate('Options have been updated'),
    errorMessage: translate('Unable to update options.'),
    refetch: props.resolve.refetch,
  });

  return (
    <Form
      onSubmit={async (values) => {
        try {
          await updateMutation.mutateAsync(values);
        } catch {
          // Handled by useManagedMutation
        }
      }}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <ActionDialogFinal
          title={translate('Update option')}
          submitLabel={translate('Update')}
          onSubmit={handleSubmit}
          submitting={submitting}
          invalid={invalid}
        >
          {name ? (
            <OptionsForm options={options} />
          ) : (
            translate('There are no resource options defined in the offering.')
          )}
        </ActionDialogFinal>
      )}
    />
  );
};
