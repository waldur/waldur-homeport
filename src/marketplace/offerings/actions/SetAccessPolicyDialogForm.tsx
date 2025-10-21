import { FunctionComponent } from 'react';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';
import {
  marketplaceProviderOfferingsUpdateOrganizationGroups,
  marketplacePlansUpdateOrganizationGroups,
  OrganizationGroup,
  customersUpdateOrganizationGroups,
} from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { SET_ACCESS_POLICY_FORM_ID } from '@waldur/marketplace/offerings/actions/constants';
import { formatRequestBodyForSetAccessPolicyForm } from '@waldur/marketplace/offerings/actions/utils';
import { Offering, Plan } from '@waldur/marketplace/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { SetAccessPolicyFormContainer } from './SetAccessPolicyFormContainer';

interface SetAccessPolicyDialogFormOwnProps {
  offering?: Offering;
  plan?: Plan;
  customer?: any;
  organizationGroups: OrganizationGroup[];
  refetch: any;
}

const PureSetAccessPolicyDialogForm: FunctionComponent<any> = (props) => {
  const dispatch = useDispatch();
  const submitRequest = async (formData) => {
    try {
      const updateAccessPolicy = props.plan
        ? marketplacePlansUpdateOrganizationGroups
        : props.offering
          ? marketplaceProviderOfferingsUpdateOrganizationGroups
          : customersUpdateOrganizationGroups;
      const uuid = props.plan
        ? props.plan.uuid
        : props.offering
          ? props.offering.uuid
          : props.customer.uuid;

      await updateAccessPolicy({
        path: { uuid },
        body: {
          organization_groups: formatRequestBodyForSetAccessPolicyForm(
            formData,
            props.organizationGroups,
          ),
        },
      });
      dispatch(
        showSuccess(translate('Access policy has been updated successfully.')),
      );
      props.refetch();
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
        title={
          props.plan
            ? translate('Set access policy for {planName}', {
                planName: props.plan?.name,
              })
            : props.offering
              ? translate('Set access policy for {offeringName}', {
                  offeringName: props.offering?.name,
                })
              : translate('Set organization groups for {customerName}', {
                  customerName: props.customer?.name,
                })
        }
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
) => {
  const initialValues = {};
  ownProps.organizationGroups.forEach((group) => {
    initialValues[group.uuid] =
      ownProps.offering?.organization_groups?.some(
        (selectedGroup) => selectedGroup.uuid === group.uuid,
      ) ||
      ownProps.plan?.organization_groups?.some(
        (selectedGroup) => selectedGroup.uuid === group.uuid,
      ) ||
      ownProps.customer?.organization_groups?.some(
        (selectedGroup) => selectedGroup.uuid === group.uuid,
      );
  });
  return { initialValues };
};

const connector = connect(mapStateToProps);

const enhance = compose(
  connector,
  reduxForm<SetAccessPolicyDialogFormOwnProps>({
    form: SET_ACCESS_POLICY_FORM_ID,
    enableReinitialize: true,
  }),
);

export const SetAccessPolicyDialogForm = enhance(PureSetAccessPolicyDialogForm);
