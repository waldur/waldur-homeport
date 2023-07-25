import { useCallback, useState } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { SubmitButton, SelectField } from '@waldur/form';
import { MonacoField } from '@waldur/form/MonacoField';
import { translate } from '@waldur/i18n';
import {
  runOfferingScript,
  updateProviderOfferingSecretOptions,
} from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { EDIT_SCRIPT_FORM_ID } from './constants';
import { ScriptEditorProps } from './types';

type OwnProps = { resolve: ScriptEditorProps };

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

export const EditScriptDialog = connect<{}, {}, OwnProps>((_, ownProps) => ({
  initialValues: {
    script: ownProps.resolve.offering.secret_options[ownProps.resolve.type],
  },
}))(
  reduxForm<{}, OwnProps>({
    form: EDIT_SCRIPT_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const [scriptExecutionResult, setScriptExecutionResult] = useState('');
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
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update script.')),
          );
        }
      },
      [dispatch],
    );

    const handleSaveButtonClick = () => {
      props.handleSubmit(update)();
      dispatch(closeModalDialog());
    };

    const handleSaveAndRunScriptButtonClick = async () => {
      const planUrl = props.resolve.offering?.plans?.length
        ? props.resolve.offering.plans[0].url
        : null;
      await props.handleSubmit(update)();
      props.reset(); // "Clean" the form after saving new changes
      try {
        const response: any = await runOfferingScript(
          props.resolve.offering.uuid,
          planUrl,
          props.resolve.dry_run,
        );

        setScriptExecutionResult(response.data.output);
        dispatch(
          showSuccess(
            translate('{type} script was executed successfully', {
              type: props.resolve.dry_run,
            }),
          ),
        );
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('{type} script got an error', {
              type: props.resolve.dry_run,
            }),
          ),
        );
      }
    };

    return (
      <form>
        <Modal.Header>
          <Modal.Title>{props.resolve.label}</Modal.Title>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSaveAndRunScriptButtonClick}
          >
            {translate('Save & dry run script')}
          </button>
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

                {scriptExecutionResult && (
                  <div className="mt-4">
                    <h4>{translate('Script execution result')}</h4>
                    <hr />
                    <pre>{scriptExecutionResult}</pre>
                    <hr />
                  </div>
                )}
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Save')}
            onClick={handleSaveButtonClick}
          />
        </Modal.Footer>
      </form>
    );
  }),
);
