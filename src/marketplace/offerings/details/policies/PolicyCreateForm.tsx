import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { FormRenderProps } from 'react-final-form';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { policyPeriodOptions } from '@/customer/cost-policies/utils';
import { NumberGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { useOrganizationGroups } from '@/marketplace/common/utils';

import { getOfferingPolicyActionOptions } from '../utils';

import { ComponentLimitsField } from './ComponentLimitsField';
import {
  OfferingCostPolicyFormData,
  OfferingUsagePolicyFormData,
  OfferingPolicyType,
} from './types';

interface PolicyCreateFormProps extends Partial<
  FormRenderProps<OfferingCostPolicyFormData | OfferingUsagePolicyFormData>
> {
  type: OfferingPolicyType;
  offering?: Offering;
}

export const PolicyCreateForm: FC<PolicyCreateFormProps> = (props) => {
  const {
    isLoading: groupsLoading,
    error: groupsError,
    data: organizationGroups,
    refetch: refetchGroups,
  } = useOrganizationGroups();

  return (
    <div className="size-lg">
      {props.type === 'usage' ? (
        <ComponentLimitsField components={props.offering.components} />
      ) : (
        <NumberGroup
          name="limit_cost"
          placeholder={translate('Enter the cost threshold (e.g. 1000 EUR)')}
          unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
          validate={required}
          label={translate('When estimated cost reaches')}
          required
        />
      )}
      <SelectGroup
        name="actions"
        placeholder={translate(
          'Select action to take when the condition is met...',
        )}
        options={getOfferingPolicyActionOptions()}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        simpleValue
        validate={required}
        label={translate('Then')}
        required
      />
      <SelectGroup
        name="period"
        placeholder={translate('Select period')}
        options={Object.values(policyPeriodOptions)}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        simpleValue
        validate={required}
        label={translate('Period')}
        required
      />
      {groupsLoading ? (
        <LoadingSpinner />
      ) : groupsError ? (
        <LoadingErred
          loadData={refetchGroups}
          message={translate('Unable to load organization groups.')}
        />
      ) : (
        <SelectGroup
          name="organization_groups"
          placeholder={translate('Select organization groups')}
          options={organizationGroups}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.value}
          simpleValue
          isMulti
          spaceless
          validate={required}
          label={translate('Organization groups')}
          required
        />
      )}
      {props.submitError && (
        <Form.Group>
          <div className="text-danger">{props.submitError}</div>
        </Form.Group>
      )}
    </div>
  );
};
