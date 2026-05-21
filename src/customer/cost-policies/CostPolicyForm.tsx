import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useRef } from 'react';
import { Table } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';
import {
  invoiceItemsCustomerCostsForPeriodRetrieve,
  invoiceItemsProjectCostsForPeriodRetrieve,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { defaultCurrency } from '@/core/formatCurrency';
import { composeValidators, required } from '@/core/validators';
import { FormContainer, NumberField, SelectField, StringField } from '@/form';
import { Select } from '@/form/AsyncSelectField';
import { translate } from '@/i18n';
import {
  organizationAutocomplete,
  projectAutocomplete,
} from '@/marketplace/common/autocompletes';
import { ProjectCostField } from '@/project/ProjectCostField';
import { useCustomer } from '@/workspace/hooks';

import { CostPolicyType } from './types';
import {
  getCostPolicyActionOptions,
  policyPeriodOptions,
  validateEmails,
} from './utils';

interface CostPolicyFormProps {
  type: CostPolicyType;
  isEdit: boolean;
}

export const CostPolicyForm: FC<CostPolicyFormProps> = (props) => {
  const currentOrganization = useCustomer();
  const { values } = useFormState({ subscription: { values: true } });

  const selectedEntities = values.scope || [];
  const selectedPeriod = values.period;
  const selectedAction = values.actions;

  const { data: costsData = [] } = useQuery({
    queryKey: [
      'cost-policies-costs',
      props.type,
      selectedEntities.map((e) => e.uuid),
      selectedPeriod,
    ],
    queryFn: async () => {
      const costs = await Promise.all(
        selectedEntities.map((entity) => {
          if (props.type === 'project') {
            return invoiceItemsProjectCostsForPeriodRetrieve({
              query: {
                project_uuid: entity.uuid,
                period: selectedPeriod,
              },
            }).then((r) => r.data);
          } else {
            return invoiceItemsCustomerCostsForPeriodRetrieve({
              query: {
                customer_uuid: entity.uuid,
                period: selectedPeriod,
              },
            }).then((r) => r.data);
          }
        }),
      );
      return costs.map((cost, index) => {
        const previousMonths = cost.total_price
          ? parseFloat(cost.total_price)
          : 0;
        const currentMonth = parseFloat(
          selectedEntities[index].billing_price_estimate?.current || 0,
        );
        const total = parseFloat((previousMonths + currentMonth).toFixed(2));
        return {
          name: selectedEntities[index].name,
          previous_months: previousMonths,
          current_month: currentMonth,
          total,
        };
      });
    },
    enabled: selectedEntities.length > 0 && !!selectedPeriod,
  });

  return (
    <FormContainer className="size-lg">
      <FormWatcher />
      {props.type === 'project' ? (
        <Select
          name="scope"
          label={translate('Select project(s)')}
          validate={required}
          required
          placeholder={translate('Search and select project...')}
          loadOptions={(query, prevOptions, page) =>
            projectAutocomplete(
              currentOrganization?.uuid,
              query,
              prevOptions,
              page,
              {
                field: [
                  'name',
                  'uuid',
                  'url',
                  'billing_price_estimate',
                  'project_credit',
                ],
              },
            )
          }
          isMulti
          isDisabled={props.isEdit}
          getOptionLabel={(option) => {
            const costField = ProjectCostField({ row: option });
            const creditField = defaultCurrency(option.project_credit);
            const creditInfo =
              option.project_credit != null
                ? ` / ${translate('project credit')}: ${creditField}`
                : '';
            return `${option.name} / est. ${costField} ${translate('this month')}${creditInfo}`;
          }}
          getOptionValue={(option) => option.url}
          noOptionsMessage={() => translate('No projects')}
        />
      ) : (
        <Select
          name="scope"
          label={translate('Select organization(s)')}
          validate={required}
          required
          placeholder={translate('Search and select organization...')}
          loadOptions={(query, prevOptions, page) =>
            organizationAutocomplete(query, prevOptions, page, {
              field: [
                'name',
                'uuid',
                'url',
                'customer_credit',
                'billing_price_estimate',
              ],
            })
          }
          isMulti
          isDisabled={props.isEdit}
          getOptionValue={(option) => option.url}
          getOptionLabel={(option) => {
            const creditField = defaultCurrency(option.customer_credit);
            const creditInfo =
              option.customer_credit != null
                ? ` / ${translate('customer credit')}: ${creditField}`
                : '';
            return `${option.name}${creditInfo}`;
          }}
          noOptionsMessage={() => translate('No organizations')}
        />
      )}
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

      {costsData && costsData.length !== 0 && (
        <Table bordered>
          <thead>
            <tr>
              <th>
                {props.type === 'project'
                  ? translate('Project')
                  : translate('Organization')}
              </th>
              <th>{translate('Previous months')}</th>
              <th>{translate('Current month')}</th>
              <th>{translate('Total')}</th>
            </tr>
          </thead>
          <tbody>
            {costsData.map((costData, index) => (
              <tr key={index}>
                <td>{costData.name}</td>
                <td>{defaultCurrency(costData.previous_months)}</td>
                <td>{defaultCurrency(costData.current_month)}</td>
                <td>{defaultCurrency(costData.total)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <NumberField
        label={translate('When estimated cost reaches')}
        name="limit_cost"
        placeholder={translate('Enter the cost threshold (e.g. 1000 EUR)')}
        validate={required}
        required={true}
        unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
      />

      <SelectField
        name="actions"
        label={translate('Then')}
        placeholder={translate(
          'Select action to take when the condition is met...',
        )}
        validate={required}
        required
        options={getCostPolicyActionOptions(props.type)}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
      />

      {selectedAction?.value === 'notify_external_user' && (
        <StringField
          name="options.notify_external_user"
          label={translate('External user emails')}
          placeholder={translate(
            'Enter email addresses separated by commas (e.g., user1@example.com, user2@example.com)',
          )}
          validate={composeValidators(required, validateEmails)}
        />
      )}
    </FormContainer>
  );
};

const FormWatcher = () => {
  const { values } = useFormState({ subscription: { values: true } });
  const { change } = useForm();
  const prevActionRef = useRef(values.actions?.value);

  useEffect(() => {
    if (values.actions?.value !== prevActionRef.current) {
      if (prevActionRef.current !== undefined) {
        change('options', {});
      }
      prevActionRef.current = values.actions?.value;
    }
  }, [values.actions, change]);

  return null;
};
