import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { SET_ACCESS_POLICY_FORM_ID } from '@waldur/marketplace/offerings/actions/constants';
import {
  formatRequestBodyForSetAccessPolicyForm,
  getInitialValuesForSetAccessPolicyForm,
} from '@waldur/marketplace/offerings/actions/utils';
import { setAccessPolicy } from '@waldur/marketplace/offerings/store/constants';
import { OrganizationGroup, Offering } from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { SetAccessPolicyFormContainer } from './SetAccessPolicyFormContainer';

interface SetAccessPolicyDialogFormOwnProps {
  offering: Offering;
  organizationGroups: OrganizationGroup[];
}

const PureSetAccessPolicyDialogForm: FunctionComponent<any> = (props) => (
  <form onSubmit={props.handleSubmit(props.submitRequest)}>
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

const mapStateToProps = (
  _state,
  ownProps: SetAccessPolicyDialogFormOwnProps,
) => ({
  initialValues: getInitialValuesForSetAccessPolicyForm(
    ownProps.offering.divisions,
  ),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  submitRequest: (formData) =>
    setAccessPolicy(
      {
        offeringUuid: ownProps.offering.uuid,
        organizationGroups: formatRequestBodyForSetAccessPolicyForm(
          formData,
          ownProps.organizationGroups,
        ),
      },
      dispatch,
    ),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm<SetAccessPolicyDialogFormOwnProps>({
    form: SET_ACCESS_POLICY_FORM_ID,
  }),
);

export const SetAccessPolicyDialogForm = enhance(PureSetAccessPolicyDialogForm);
