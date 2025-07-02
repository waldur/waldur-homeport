import { get, set } from 'lodash-es';
import { connect, useDispatch } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { EDIT_INTEGRATION_FORM_ID } from './constants';
import { EditOfferingProps } from './types';

export const EditFieldDialog = connect<{}, {}, { resolve: EditOfferingProps }>(
  (_, ownProps) => ({
    initialValues: {
      value: get(ownProps.resolve.scope, ownProps.resolve.name),
    },
  }),
)(
  reduxForm<{ value: any }, { resolve: EditOfferingProps }>({
    form: EDIT_INTEGRATION_FORM_ID,
    destroyOnUnmount: true,
  })((props) => {
    const dispatch = useDispatch();
    return (
      <form
        onSubmit={props.handleSubmit((formData) =>
          props.resolve
            .callback(set({}, props.resolve.name, formData.value))
            .then(() => {
              dispatch(closeModalDialog());
            }),
        )}
      >
        <ModalDialog
          title={props.resolve.title}
          subtitle={props.resolve.description}
          headerLess={!props.resolve.title}
          bodyClassName="pb-2"
          footerClassName="border-0 pt-0 gap-2"
          footer={
            <>
              <CloseDialogButton className="flex-grow-1" />
              <SubmitButton
                disabled={props.invalid || !props.dirty}
                submitting={props.submitting}
                label={translate('Confirm')}
                className="btn btn-primary flex-grow-1"
              />
            </>
          }
        >
          <FormContainer submitting={props.submitting}>
            <Field
              component={props.resolve.fieldComponent}
              name="value"
              label={props.resolve.label}
              hideLabel={props.resolve.hideLabel}
              tooltip={props.resolve.warnTooltip}
              required={props.resolve.required}
              {...props.resolve.fieldProps}
            />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
