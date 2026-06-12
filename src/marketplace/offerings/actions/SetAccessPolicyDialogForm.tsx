import { FunctionComponent, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsUpdateOrganizationGroups,
  marketplacePlansUpdateOrganizationGroups,
  OrganizationGroup,
  customersUpdateOrganizationGroups,
  ProviderOfferingDetails as Offering,
  ProviderPlanDetails as Plan,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { formatRequestBodyForSetAccessPolicyForm } from '@/marketplace/offerings/actions/utils';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { SetAccessPolicyFormContainer } from './SetAccessPolicyFormContainer';

interface SetAccessPolicyDialogFormProps {
  offering?: Pick<Offering, 'uuid' | 'name' | 'organization_groups'>;
  plan?: Plan;
  customer?: any;
  organizationGroups: OrganizationGroup[];
  refetch: any;
}

export const SetAccessPolicyDialogForm: FunctionComponent<
  SetAccessPolicyDialogFormProps
> = (props) => {
  const initialValues = useMemo(() => {
    const values = {};
    props.organizationGroups.forEach((group) => {
      values[group.uuid] =
        props.offering?.organization_groups?.some(
          (selectedGroup) => selectedGroup.uuid === group.uuid,
        ) ||
        props.plan?.organization_groups?.some(
          (selectedGroup) => selectedGroup.uuid === group.uuid,
        ) ||
        props.customer?.organization_groups?.some(
          (selectedGroup) => selectedGroup.uuid === group.uuid,
        );
    });
    return values;
  }, [props.organizationGroups, props.offering, props.plan, props.customer]);

  const updateMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
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

      return updateAccessPolicy({
        path: { uuid },
        body: {
          organization_groups: formatRequestBodyForSetAccessPolicyForm(
            formData,
            props.organizationGroups,
          ),
        },
      });
    },
    successMessage: translate('Access policy has been updated successfully.'),
    errorMessage: translate('Unable to update access policy.'),
    refetch: props.refetch,
  });

  return (
    <Form
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
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
                  submitting={submitting}
                  label={translate('Save')}
                />
              </>
            }
          >
            <SetAccessPolicyFormContainer
              organizationGroups={props.organizationGroups}
              submitting={submitting}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
