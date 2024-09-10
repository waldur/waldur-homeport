import { useMemo } from 'react';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { submitResourceOptions } from '@waldur/marketplace/common/api';
import { OptionsForm } from '@waldur/marketplace/common/OptionsForm';
import { Offering, OptionField } from '@waldur/marketplace/types';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { Resource } from '../types';

interface UpdateResourceOptionDialogProps {
  resolve: {
    resource: Resource & { options };
    offering: Offering;
    option: OptionField & { name };
    refetch?;
  };
}

export const UpdateResourceOptionDialog = connect(
  (_, ownProps: UpdateResourceOptionDialogProps) => ({
    initialValues: {
      attributes: {
        [ownProps.resolve.option.name]:
          ownProps.resolve.resource && ownProps.resolve.resource.options
            ? ownProps.resolve.resource.options[ownProps.resolve.option.name]
            : null,
      },
    },
  }),
)(
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
