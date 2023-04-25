import { Modal, Col, Row } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { reduxForm } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import {
  getAllOrganizationGroups,
  updateProviderOfferingAccessPolicy,
} from '@waldur/marketplace/common/api';
import { SetAccessPolicyFormContainer } from '@waldur/marketplace/offerings/actions/SetAccessPolicyFormContainer';
import {
  formatRequestBodyForSetAccessPolicyForm,
  getInitialValuesForSetAccessPolicyForm,
} from '@waldur/marketplace/offerings/actions/utils';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';

export const PagePolicies = connect<{}, {}, { offering }>((_, props) => ({
  initialValues: getInitialValuesForSetAccessPolicyForm(
    props.offering.organizationGroups,
  ),
}))(
  reduxForm<{}, any>({
    form: 'PublicOfferingAccessPolicyEditor',
  })(
    ({
      submitting,
      handleSubmit,
      invalid,
      onReturn,
      refreshOffering,
      offering,
    }) => {
      const dispatch = useDispatch();
      const {
        loading,
        error,
        value: organizationGroups,
      } = useAsync(async () => await getAllOrganizationGroups(), [offering]);
      const updateOfferingHandler = async (formData) => {
        try {
          await updateProviderOfferingAccessPolicy(
            offering.uuid,
            formatRequestBodyForSetAccessPolicyForm(
              formData,
              organizationGroups,
            ),
          );
          await refreshOffering();
          dispatch(showSuccess(translate('Offering has been updated.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showError(translate('Unable to update offering.')));
        }
      };
      return (
        <form onSubmit={handleSubmit(updateOfferingHandler)}>
          <Modal.Header onClick={onReturn} style={{ cursor: 'pointer' }}>
            <Modal.Title>
              <i className="fa fa-arrow-left"></i> {translate('Access policy')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col lg={12}>
                {loading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <>{translate('Unable to load organization groups.')}</>
                ) : (
                  <SetAccessPolicyFormContainer
                    organizationGroups={organizationGroups}
                    submitting={submitting}
                  />
                )}
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <SubmitButton
              disabled={invalid}
              submitting={submitting}
              label={translate('Update')}
            />
          </Modal.Footer>
        </form>
      );
    },
  ),
);
