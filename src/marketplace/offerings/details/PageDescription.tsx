import { useEffect } from 'react';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import {
  updateOfferingAttributes,
  updateOfferingDescription,
} from '@waldur/marketplace/common/api';
import { DescriptionUpdateContainer } from '@waldur/marketplace/offerings/create/DescriptionUpdateContainer';
import * as actions from '@waldur/marketplace/offerings/store/actions';
import { formatOfferingRequest } from '@waldur/marketplace/offerings/store/utils';
import { getInitialValues } from '@waldur/marketplace/offerings/update/utils';
import { closeModalDialog } from '@waldur/modal/actions';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

export const PageDescription = connect((state: RootState) => ({
  initialValues: getInitialValues(state),
}))(
  reduxForm<{}, any>({
    form: 'PublicOfferingDescriptionEditor',
  })(
    ({
      submitting,
      handleSubmit,
      invalid,
      onReturn,
      refreshOffering,
      offering,
      category,
    }) => {
      const dispatch = useDispatch();
      const updateOfferingHandler = async (formData) => {
        try {
          const offeringRequest = formatOfferingRequest(formData, []);
          await updateOfferingDescription(
            offering.uuid,
            offeringRequest.category,
          );
          await updateOfferingAttributes(
            offering.uuid,
            offeringRequest.attributes,
          );
          await refreshOffering();
          dispatch(showSuccess(translate('Offering has been updated.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to update offering.')),
          );
        }
      };
      useEffect(() => {
        dispatch(actions.categoryChanged(category));
      }, [category]);
      return (
        <form onSubmit={handleSubmit(updateOfferingHandler)}>
          <ModalHeader onClick={onReturn} style={{ cursor: 'pointer' }}>
            <ModalTitle>
              <i className="fa fa-arrow-left"></i> {translate('Description')}
            </ModalTitle>
          </ModalHeader>
          <ModalBody>
            <DescriptionUpdateContainer />
          </ModalBody>
          <ModalFooter>
            <SubmitButton
              disabled={invalid}
              submitting={submitting}
              label={translate('Update')}
            />
          </ModalFooter>
        </form>
      );
    },
  ),
);
