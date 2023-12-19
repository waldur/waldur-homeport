import { useCallback } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { FieldArray, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updateOfferingSecretOptions } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ENVIRON_FORM_ID } from './constants';
import { EnvironmentVariablesList } from './EnvironmentVariablesList';

type OwnProps = { resolve: { offering; type; refetch } };

export const EditVarsDialog = connect<{}, {}, OwnProps>((_, ownProps) => ({
  initialValues: {
    environ: ownProps.resolve.offering.secret_options.environ,
  },
}))(
  reduxForm<{}, OwnProps>({
    form: ENVIRON_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          await updateOfferingSecretOptions(props.resolve.offering.uuid, {
            secret_options: {
              ...props.resolve.offering.secret_options,
              environ: formData.environ,
            },
          });
          dispatch(
            showSuccess(
              translate(
                'Environment variables have been updated successfully.',
              ),
            ),
          );
          if (props.resolve.refetch) {
            await props.resolve.refetch();
          }
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(
              error,
              translate('Unable to update environment variables.'),
            ),
          );
        }
      },
      [dispatch],
    );
    return (
      <FieldArray
        name="environ"
        component={(nestedProps) => (
          <form onSubmit={props.handleSubmit(update)}>
            <Modal.Header>
              <Modal.Title>
                {translate('Edit environment variables')}
              </Modal.Title>
              <Button
                variant="light"
                size="sm"
                className="btn-icon"
                onClick={() => nestedProps.fields.push({})}
              >
                <i className="fa fa-plus fs-4" />
              </Button>
            </Modal.Header>
            <Modal.Body>
              <EnvironmentVariablesList fields={nestedProps.fields} />
            </Modal.Body>
            <Modal.Footer>
              <SubmitButton
                disabled={props.invalid}
                submitting={props.submitting}
                label={translate('Save')}
              />
            </Modal.Footer>
          </form>
        )}
      />
    );
  }),
);
