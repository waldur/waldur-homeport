import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { Field, reduxForm, InjectedFormProps } from 'redux-form';

import { formatDate } from '@waldur/core/dateUtils';
import { FormContainer, SubmitButton } from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/marketplace/resources/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { EDIT_RESOURCE_END_DATE_FORM_ID } from './constants';

type OwnProps = {
  resolve: {
    resource: Resource;
    refetch?(): void;
    updateEndDate?(uuid: string, date: string);
  };
};

type StateProps = ReturnType<typeof mapStateToProps>;

interface FormData {
  end_date: string;
}

const PureEditResourceEndDateDialog: FunctionComponent<
  InjectedFormProps<{}> & OwnProps & StateProps
> = (props) => {
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
      if (props.resolve.refetch) {
        await props.resolve.refetch();
      }
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to edit resource.')));
    }
  };

  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Set termination date of {resourceName}', {
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
            label={translate('Termination date')}
            component={DateField}
            disabled={props.submitting}
            description={translate(
              'The date is inclusive. Once reached, resource will be scheduled for termination.',
            )}
            minDate={DateTime.now().plus({ weeks: 1 }).toISO()}
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

const connector = connect<StateProps, {}, OwnProps>(mapStateToProps);

const enhance = compose(
  connector,
  reduxForm<FormData, OwnProps>({
    form: EDIT_RESOURCE_END_DATE_FORM_ID,
  }),
);

export const EditResourceEndDateDialog = enhance(PureEditResourceEndDateDialog);
