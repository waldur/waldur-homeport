import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { InjectedFormProps } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { policyPeriodOptions } from '@waldur/customer/cost-policies/utils';
import {
  FormContainer,
  FieldError,
  NumberField,
  SelectField,
} from '@waldur/form';
import { translate } from '@waldur/i18n';
import { useOrganizationGroups } from '@waldur/marketplace/common/utils';
import { Offering } from '@waldur/marketplace/types';

import { getOfferingPolicyActionOptions } from '../utils';

import { ComponentLimitsField } from './ComponentLimitsField';
import { OfferingPolicyType } from './types';

interface PolicyCreateFormProps extends Partial<InjectedFormProps> {
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
    <FormContainer submitting={props.submitting} className="size-lg">
      {props.type === 'usage' ? (
        <ComponentLimitsField components={props.offering.components} />
      ) : (
        <NumberField
          label={translate('When estimated cost reaches')}
          name="limit_cost"
          placeholder={translate('Enter the cost threshold (e.g. 1000 EUR)')}
          validate={required}
          required={true}
          unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
        />
      )}
      <SelectField
        name="actions"
        label={translate('Then')}
        placeholder={
          translate('Select action to take when the condition is met') + '...'
        }
        validate={required}
        required
        options={getOfferingPolicyActionOptions()}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        simpleValue
      />
      <SelectField
        name="period"
        label={translate('Period')}
        validate={required}
        required
        options={Object.values(policyPeriodOptions)}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        simpleValue
      />
      {groupsLoading ? (
        <LoadingSpinner />
      ) : groupsError ? (
        <LoadingErred
          loadData={refetchGroups}
          message={translate('Unable to load organization groups.')}
        />
      ) : (
        <SelectField
          name="organization_groups"
          label={translate('Organization groups')}
          validate={required}
          required
          options={organizationGroups}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.value}
          simpleValue
          isMulti
          spaceless
        />
      )}
      <Form.Group>
        <FieldError error={props.error} />
      </Form.Group>
    </FormContainer>
  );
};
