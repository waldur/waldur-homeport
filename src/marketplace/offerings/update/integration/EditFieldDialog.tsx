import { get, set } from 'lodash-es';
import { connect, useDispatch } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { SubmitButton } from '@/form';
import { FormContainer } from '@/form/FormContainer';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

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
          footer={
            <>
              <CloseDialogButton className="flex-equal" />
              <SubmitButton
                disabled={props.invalid || !props.dirty}
                submitting={props.submitting}
                label={translate('Confirm')}
                className="btn btn-primary flex-equal"
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
