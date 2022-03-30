import { Modal, Row, Col } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { FormContainer, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { uploadOfferingHeroImage } from '@waldur/marketplace/common/api';
import { ImageUploadField } from '@waldur/marketplace/offerings/create/ImageUploadField';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';

export const PageHeroImage = connect<{}, {}, { offering }>((_, props) => ({
  initialValues: {
    images: props.offering.image,
  },
}))(
  reduxForm<{}, any>({
    form: 'PublicOfferingHeroImageEditor',
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
      const updateOfferingHandler = async (formData) => {
        try {
          if (formData.images instanceof File || formData.images === '') {
            await uploadOfferingHeroImage(offering.uuid, formData.images);
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
              <i className="fa fa-arrow-left"></i> {translate('Hero image')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col lg={12}>
                <FormContainer
                  submitting={submitting}
                  labelClass="col-lg-12"
                  controlClass="col-lg-12"
                >
                  <ImageUploadField
                    name="images"
                    label={translate('Image: ')}
                    accept={'image/*'}
                    buttonLabel={translate('Browse')}
                    required={true}
                  />
                </FormContainer>
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
