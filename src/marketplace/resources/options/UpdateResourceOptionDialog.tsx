import { useMemo } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import {
  marketplaceResourcesUpdateOptions,
  OptionField,
  Resource,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { OptionsForm } from '@/marketplace/common/OptionsForm';
import { Offering } from '@/marketplace/types';
import { ActionDialog } from '@/modal/ActionDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export interface UpdateResourceOptionDialogProps {
  resolve: {
    resource: Resource;
    offering: Offering;
    option: OptionField & { name };
    refetch?;
  };
}

export const UpdateResourceOptionDialog = connect<
  {},
  {},
  UpdateResourceOptionDialogProps
>((_, ownProps) => ({
  initialValues: {
    attributes: {
      [ownProps.resolve.option.name]:
        ownProps.resolve.resource && ownProps.resolve.resource.options
          ? ownProps.resolve.resource.options[ownProps.resolve.option.name]
          : null,
    },
  },
}))(
  reduxForm<{}, UpdateResourceOptionDialogProps>({
    form: 'UpdateResourceOptionDialog',
  })((props) => {
    const { name, ...option } = props.resolve.option;
    const options = useMemo(() => {
      return {
        options: { [name]: { ...option, required: false } },
        order: [name],
      };
    }, [name, option]);

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
      <ActionDialog
        title={translate('Update option')}
        submitLabel={translate('Update')}
        onSubmit={props.handleSubmit((values: any) =>
          updateMutation.mutateAsync(values),
        )}
        submitting={props.submitting}
        invalid={props.invalid}
      >
        {name ? (
          <OptionsForm options={options} />
        ) : (
          translate('There are no resource options defined in the offering.')
        )}
      </ActionDialog>
    );
  }),
);
