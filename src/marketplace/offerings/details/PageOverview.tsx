import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import {
  updateProviderOfferingOverview,
  uploadProviderOfferingThumbnail,
} from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';

import { OverviewStep } from '../create/OverviewStep';

export const PageOverview = connect<{}, {}, { offering }>((_, props) => ({
  initialValues: {
    name: props.offering.name,
    description: props.offering.description,
    full_description: props.offering.full_description,
    privacy_policy_link: props.offering.privacy_policy_link,
    terms_of_service: props.offering.terms_of_service,
    terms_of_service_link: props.offering.terms_of_service_link,
    thumbnail: props.offering.thumbnail,
  },
}))(
  reduxForm<{}, any>({
    form: 'PublicOfferingEditor',
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
      const updateOfferingHandler = async ({ thumbnail, ...formData }) => {
        try {
          await updateProviderOfferingOverview(offering.uuid, formData);
          if (thumbnail instanceof File || thumbnail === '') {
            await uploadProviderOfferingThumbnail(offering.uuid, thumbnail);
          }
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
              <i className="fa fa-arrow-left"></i> {translate('Overview')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <OverviewStep submitting={submitting} />
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
