import delay from '@redux-saga/delay-p';
import { useCallback, useState } from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Field, getFormValues, initialize, reduxForm } from 'redux-form';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { SubmitButton, SelectField } from '@waldur/form';
import { MonacoField } from '@waldur/form/MonacoField';
import { translate } from '@waldur/i18n';
import {
  asyncRunOfferingScript,
  getAsyncDryRun,
  updateOfferingSecretOptions,
} from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  showError,
  showErrorResponse,
  showSuccess,
} from '@waldur/store/notify';

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
    const [executing, setExecuting] = useState<boolean>(false);
    const [scriptExecutionResult, setScriptExecutionResult] = useState('');
    const formValues = useSelector(getFormValues(EDIT_SCRIPT_FORM_ID));
    const update = useCallback(
      async (formData) => {
        try {
          await updateOfferingSecretOptions(props.resolve.offering.uuid, {
            secret_options: {
              ...props.resolve.offering.secret_options,
              [props.resolve.type]: formData.script,
            },
          });
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
      [dispatch, props.resolve],
    );

    const handleSaveButtonClick = () => {
      props.handleSubmit(update)();
      dispatch(closeModalDialog());
    };

    const pollAsyncDryRunResult = async (dryRunUuid: string) => {
      let asyncDryRunResult: any;
      setExecuting(true);
      do {
        asyncDryRunResult = await getAsyncDryRun(dryRunUuid);
        if (asyncDryRunResult.data.get_state_display === 'erred') {
          break;
        }
        await delay(3000);
      } while (asyncDryRunResult.data.get_state_display !== 'done');
      setExecuting(false);
      return asyncDryRunResult;
    };

    const handleSaveAndRunScriptButtonClick = async () => {
      const planUrl = props.resolve.offering?.plans?.length
        ? props.resolve.offering.plans[0].url
        : null;
      await props.handleSubmit(update)();
      try {
        const response: any = await asyncRunOfferingScript(
          props.resolve.offering.uuid,
          planUrl,
          props.resolve.dry_run,
        );

        const asyncDryRunResult: any = await pollAsyncDryRunResult(
          response.data.uuid,
        );
        if (asyncDryRunResult.data.get_state_display === 'erred') {
          dispatch(showError('An error occurred during script execution.'));
        } else {
          dispatch(
            showSuccess(
              translate('{type} script was executed successfully', {
                type: props.resolve.dry_run,
              }),
            ),
          );
        }
        setScriptExecutionResult(asyncDryRunResult.data.output);
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
      dispatch(initialize(EDIT_SCRIPT_FORM_ID, formValues));
    };

    return (
      <form>
        <Modal.Header>
          <Modal.Title>{props.resolve.label}</Modal.Title>
          {props.resolve.type !== 'language' ? (
            props.resolve.offering.secret_options.language ? (
              <Button
                variant="secondary"
                onClick={handleSaveAndRunScriptButtonClick}
                disabled={executing}
              >
                {executing && (
                  <>
                    <LoadingSpinnerIcon className="me-1" />{' '}
                  </>
                )}
                {translate('Save & dry run script')}
              </Button>
            ) : (
              <Tip
                label={translate(
                  'Please select a script language to use dry-run',
                )}
                id="resource-action-dialog-disabled-tooltip"
              >
                <Button variant="secondary" disabled>
                  {translate('Save & dry run script')}
                </Button>
              </Tip>
            )
          ) : null}
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
