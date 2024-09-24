import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { StepCardPlaceholder } from '@waldur/marketplace/deploy/steps/StepCardPlaceholder';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { loadSecurityGroups } from '@waldur/openstack/api';
import { FormSecurityGroupsStep } from '@waldur/openstack/openstack-instance/deploy/FormSecurityGroupsStep';

import { formTenantSelector } from './utils';

export const FormRancherSecurityGroupsStep = (props: FormStepProps) => {
  const tenant = useSelector(formTenantSelector);

  // Fetch default security group
  const { data: defaultItems } = useQuery(
    ['security-groups-step-default', tenant],
    () =>
      tenant ? loadSecurityGroups({ tenant: tenant.url, name: 'default' }) : [],
    { staleTime: 3 * 60 * 1000 },
  );

  // Select default security group initially
  useEffect(() => {
    const defaultSecurityGroup = defaultItems?.find(
      (group) => group.name === 'default',
    );

    if (defaultSecurityGroup) {
      props.change('attributes.security_groups', [
        { ...defaultSecurityGroup, clearableValue: false },
      ]);
    }
  }, [props.change, defaultItems]);

  return tenant ? (
    <FormSecurityGroupsStep {...props} offering={props.offering} />
  ) : (
    <VStepperFormStepCard
      title={translate('Security groups')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
      required={props.required}
    >
      <StepCardPlaceholder>
        {translate('Please select a tenant first')}
      </StepCardPlaceholder>
    </VStepperFormStepCard>
  );
};
