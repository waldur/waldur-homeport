import { FunctionComponent } from 'react';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updateOfferingAccessPolicy } from '@waldur/marketplace/common/api';
import { SET_ACCESS_POLICY_FORM_ID } from '@waldur/marketplace/offerings/actions/constants';
import {
  formatRequestBodyForSetAccessPolicyForm,
  getInitialValuesForSetAccessPolicyForm,
} from '@waldur/marketplace/offerings/actions/utils';
import { OrganizationGroup, Offering } from '@waldur/marketplace/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { SetAccessPolicyFormContainer } from './SetAccessPolicyFormContainer';

interface SetAccessPolicyDialogFormOwnProps {
  offering: Offering;
  organizationGroups: OrganizationGroup[];
}

const PureSetAccessPolicyDialogForm: FunctionComponent<any> = (props) => {
  const dispatch = useDispatch();
  const submitRequest = async (formData) => {
    try {
      await updateOfferingAccessPolicy(
        props.offering.uuid,
        formatRequestBodyForSetAccessPolicyForm(
          formData,
          props.organizationGroups,
        ),
      );
      dispatch(
        showSuccess(translate('Access policy has been updated successfully.')),
      );
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to update access policy.')),
      );
    }
  };
  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Set access policy for {offeringName}', {
          offeringName: props.offering.name,
        })}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              submitting={props.submitting}
              label={translate('Save')}
            />
          </>
        }
      >
        <SetAccessPolicyFormContainer
          organizationGroups={props.organizationGroups}
          submitting={props.submitting}
        />
      </ModalDialog>
    </form>
  );
};

const mapStateToProps = (
  _state,
  ownProps: SetAccessPolicyDialogFormOwnProps,
) => ({
  initialValues: getInitialValuesForSetAccessPolicyForm(
    ownProps.offering.divisions,
  ),
});

const connector = connect(mapStateToProps);

const enhance = compose(
  connector,
  reduxForm<SetAccessPolicyDialogFormOwnProps>({
    form: SET_ACCESS_POLICY_FORM_ID,
  }),
);

export const SetAccessPolicyDialogForm = enhance(PureSetAccessPolicyDialogForm);
