import { useCallback } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Field, formValueSelector, reduxForm } from 'redux-form';

import { SubmitButton, SelectField } from '@waldur/form';
import { MonacoField } from '@waldur/form/MonacoField';
import { translate } from '@waldur/i18n';
import { updateProviderOfferingSecretOptions } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { EDIT_SCRIPT_FORM_ID } from './constants';
import { TestScriptButton } from './TestScriptButton';

type OwnProps = { resolve: { offering; type; refetch; label } };

const PROGRAMMING_LANGUAGE_CHOICES = [
  {
    label: 'Python',
    value: 'python',
  },
  {
    label: 'Bash',
    value: 'shell',
  },
];

const scriptSelector = (state) =>
  formValueSelector(EDIT_SCRIPT_FORM_ID)(state, 'script');

export const EditScriptDialog = connect<{}, {}, OwnProps>((_, ownProps) => ({
  initialValues: {
    script: ownProps.resolve.offering.secret_options[ownProps.resolve.type],
  },
}))(
  reduxForm<{}, OwnProps>({
    form: EDIT_SCRIPT_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          await updateProviderOfferingSecretOptions(
            props.resolve.offering.uuid,
            {
              secret_options: {
                ...props.resolve.offering.secret_options,
                [props.resolve.type]: formData.script,
              },
            },
          );
          dispatch(
            showSuccess(translate('Script has been updated successfully.')),
          );
          if (props.resolve.refetch) {
            await props.resolve.refetch();
          }
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update script.')),
          );
        }
      },
      [dispatch],
    );
    const value = useSelector(scriptSelector);
    return (
      <form onSubmit={props.handleSubmit(update)}>
        <Modal.Header>
          <Modal.Title>{props.resolve.label}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {props.resolve.type === 'language' ? (
            <Field
              name="script"
              options={PROGRAMMING_LANGUAGE_CHOICES}
              simpleValue={true}
              required={true}
              isClearable={false}
              component={SelectField}
              className="flex-grow-1"
            />
          ) : (
            <Row>
              <Col sm={12}>
                <p>
                  {translate('Script language: {language}', {
                    language: props.resolve.offering.secret_options.language,
                  })}
                </p>
                <Field
                  name="script"
                  required={true}
                  mode={props.resolve.offering.secret_options.language}
                  component={MonacoField}
                />
                <TestScriptButton
                  type={props.resolve.type}
                  disabled={!value}
                  offering={props.resolve.offering}
                />
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Save')}
          />
        </Modal.Footer>
      </form>
    );
  }),
);
