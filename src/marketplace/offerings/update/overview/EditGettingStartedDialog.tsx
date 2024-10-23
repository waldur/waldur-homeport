import { Info } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import { connect, useDispatch, useSelector } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { CodePreview } from '@waldur/core/CodePreview';
import { Tip } from '@waldur/core/Tooltip';
import { FormContainer, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updateOfferingOverview } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { GETTING_STARTED_FORM_ID } from './constants';
import { EditOfferingProps } from './types';
import { pickOverview } from './utils';

const formValuesSelector = getFormValues(GETTING_STARTED_FORM_ID);

export const EditGettingStartedDialog = connect(
  (_, ownProps: { resolve: EditOfferingProps }) => ({
    initialValues: {
      template: ownProps.resolve.offering.getting_started,
    },
  }),
)(
  reduxForm<{}, { resolve: EditOfferingProps }>({
    form: GETTING_STARTED_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          await updateOfferingOverview(props.resolve.offering.uuid, {
            ...pickOverview(props.resolve.offering),
            getting_started: formData.template,
          });
          dispatch(
            showSuccess(translate('Offering has been updated successfully.')),
          );
          await props.resolve.refetch();
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update offering.')),
          );
        }
      },
      [dispatch],
    );
    const formValues = useSelector(formValuesSelector) as any;
    return (
      <form onSubmit={props.handleSubmit(update)}>
        <Modal.Header>
          <Modal.Title>{translate('Getting started instructions')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={12} lg={8} className="d-flex flex-column">
              <div className="flex-grow-1 min-h-225px">
                <FormContainer {...props}>
                  <TextField
                    name="template"
                    rows={15}
                    label={
                      <Tip
                        label={translate(
                          'The following substitution variables are available: {resource_name}, {resource_username}, {backend_id}, {options_key}, {backend_metadata_key}',
                        )}
                        id="template"
                      >
                        {translate('Template')}
                        <Info
                          size={16}
                          weight="fill"
                          className="text-muted ms-1"
                        />
                      </Tip>
                    }
                  />
                </FormContainer>
              </div>
            </Col>
            <Col
              xs="auto"
              className="border-end border-gray-300 border-2 mx-5 p-0"
            />
            <Col className="pb-20">
              <div className="form-label">{translate('Preview')}</div>
              <CodePreview
                template={formValues.template}
                context={{
                  resource_name: 'RESOURCE_NAME',
                  resource_username: 'RESOURCE_USERNAME',
                  backend_id: 'BACKEND_ID',
                  options_key: 'OPTIONS_VALUE',
                  backend_metadata_key: 'BACKEND_METADATA_VALUE',
                }}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton
            submitting={props.submitting}
            label={translate('Update')}
          />
          <CloseDialogButton />
        </Modal.Footer>
      </form>
    );
  }),
);
