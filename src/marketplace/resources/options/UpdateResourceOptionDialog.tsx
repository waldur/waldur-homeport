import { useMemo } from 'react';
import { connect, useDispatch } from 'react-redux';
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
import { closeModalDialog } from '@/modal/actions';
import { showErrorResponse, showSuccess } from '@/store/notify';

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

    const dispatch = useDispatch();
    const submitForm = async (formData) => {
      try {
        await marketplaceResourcesUpdateOptions({
          path: { uuid: props.resolve.resource.uuid },
          body: {
            options: formData.attributes,
          },
        });
        dispatch(showSuccess(translate('Options have been updated')));
        if (props.resolve.refetch) {
          await props.resolve.refetch();
        }
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to update options.')));
      }
    };

    return (
      <ActionDialog
        title={translate('Update option')}
        submitLabel={translate('Update')}
        onSubmit={props.handleSubmit(submitForm)}
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
