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
import { updateProviderOffering } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

import { AccountingStepContainer } from '../create/AccountingStepContainer';
import { FORM_ID } from '../store/constants';
import { getOfferingComponents, getType } from '../store/selectors';
import { formatOfferingRequest } from '../store/utils';
import { getInitialValues } from '../update/utils';

const mapStateToProps = (state: RootState) => {
  const type = getType(state);
  return {
    initialValues: getInitialValues(state),
    builtinComponents: type && getOfferingComponents(state, type),
  };
};

export const PageAccounting = connect(mapStateToProps)(
  reduxForm<{}, any>({
    form: FORM_ID /*'PublicOfferingAccountingEditor'*/,
  })(
    ({
      submitting,
      handleSubmit,
      invalid,
      onReturn,
      refreshOffering,
      offering,
      builtinComponents,
    }) => {
      const dispatch = useDispatch();

      const updateOfferingHandler = async (formData) => {
        try {
          const offeringRequest = formatOfferingRequest(
            formData,
            builtinComponents,
          );
          await updateProviderOffering(offering.uuid, offeringRequest);
          await refreshOffering();
          dispatch(showSuccess(translate('Offering has been updated.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showError(translate('Unable to update offering.')));
        }
      };

      return (
        <form onSubmit={handleSubmit(updateOfferingHandler)}>
          <ModalHeader onClick={onReturn} style={{ cursor: 'pointer' }}>
            <ModalTitle>
              <i className="fa fa-arrow-left"></i> {translate('Accounting')}
            </ModalTitle>
          </ModalHeader>
          <ModalBody>
            <AccountingStepContainer />
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
