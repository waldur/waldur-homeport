import { useQuery } from '@tanstack/react-query';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import {
  getProviderOffering,
  submitResourceOptions,
} from '@waldur/marketplace/common/api';
import { OptionsForm } from '@waldur/marketplace/common/OptionsForm';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const UpdateResourceOptionsDialog = connect(
  (_, ownProps: { resolve: { resource: { options } } }) => ({
    initialValues: {
      attributes: ownProps.resolve.resource.options,
    },
  }),
)(
  reduxForm<{}, { resolve }>({
    form: 'UpdateResourceOptionsDialog',
  })((props) => {
    const dispatch = useDispatch();
    const submitForm = async (formData) => {
      try {
        await submitResourceOptions(props.resolve.resource.uuid, {
          options: formData.attributes,
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
    const { data, isLoading, error } = useQuery(
      ['UpdateResourceOptionsDialog'],
      () => getProviderOffering(props.resolve.resource.offering_uuid),
    );

    return (
      <ActionDialog
        title={translate('Update options')}
        submitLabel={translate('Update')}
        onSubmit={props.handleSubmit(submitForm)}
        submitting={props.submitting}
        invalid={props.invalid}
      >
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          translate('Unable to load offering details')
        ) : data.resource_options?.order ? (
          <OptionsForm options={data.resource_options} />
        ) : (
          translate('There are no report fields defined in the offering.')
        )}
      </ActionDialog>
    );
  }),
);
