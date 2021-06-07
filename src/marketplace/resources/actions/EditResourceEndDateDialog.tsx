import { FunctionComponent } from 'react';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { formatDate } from '@waldur/core/dateUtils';
import { FormContainer, SubmitButton } from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { datePickerOverlayContainerInDialogs } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/marketplace/resources/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { EDIT_RESOURCE_END_DATE_FORM_ID } from './constants';

interface EditResourceEndDateDialogOwnProps {
  resource: Resource;
  reInitResource?(): void;
  refreshList?(): void;
  updateEndDate?(uuid: string, date: string);
}

interface FormData {
  end_date: string;
}

const PureEditResourceEndDateDialog: FunctionComponent<any> = (props) => {
  const dispatch = useDispatch();

  const submitRequest = async (formData: FormData) => {
    try {
      await props.resolve.updateEndDate(
        props.resolve.resource.uuid,
        formData.end_date ? formatDate(formData.end_date) : null,
      );
      dispatch(
        showSuccess(
          translate('{resourceName} resource has been updated successfully.', {
            resourceName: props.resolve.resource.name,
          }),
        ),
      );
      if (props.resolve.reInitResource) {
        await props.resolve.reInitResource();
      } else if (props.resolve.refreshList) {
        props.resolve.refreshList();
      }
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to edit resource.')));
    }
  };

  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Edit end date of {resourceName}', {
          resourceName: props.resolve.resource.name,
        })}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              submitting={props.submitting}
              label={translate('Save')}
              disabled={props.invalid}
            />
          </>
        }
      >
        <FormContainer submitting={props.submitting}>
          <Field
            name="end_date"
            label={translate('End date')}
            component={DateField}
            {...datePickerOverlayContainerInDialogs()}
            disabled={props.submitting}
            description={translate(
              'The date is inclusive. Once reached, resource will be scheduled for termination.',
            )}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
};

const mapStateToProps = (_state, ownProps) => ({
  initialValues: {
    end_date: ownProps.resolve.resource.end_date,
  },
});

const connector = connect(mapStateToProps);

const enhance = compose(
  connector,
  reduxForm<FormData, EditResourceEndDateDialogOwnProps>({
    form: EDIT_RESOURCE_END_DATE_FORM_ID,
  }),
);

export const EditResourceEndDateDialog = enhance(PureEditResourceEndDateDialog);
