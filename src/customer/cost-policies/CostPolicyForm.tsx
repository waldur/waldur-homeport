import { FC, useEffect, useState } from 'react';
import { Form, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { InjectedFormProps } from 'redux-form';
import {
  invoiceItemsCustomerCostsForPeriodRetrieve,
  invoiceItemsProjectCostsForPeriodRetrieve,
} from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { required } from '@waldur/core/validators';
import {
  FormContainer,
  FieldError,
  NumberField,
  SelectField,
  StringField,
} from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { translate } from '@waldur/i18n';
import {
  organizationAutocomplete,
  projectAutocomplete,
} from '@waldur/marketplace/common/autocompletes';
import { Option } from '@waldur/marketplace/common/registry';
import { ProjectCostField } from '@waldur/project/ProjectCostField';
import { getCustomer } from '@waldur/workspace/selectors';

import { CostPolicyFormData, CostPolicyType } from './types';
import { getCostPolicyActionOptions, policyPeriodOptions } from './utils';

interface CostPolicyFormProps
  extends Partial<InjectedFormProps<CostPolicyFormData>> {
  type: CostPolicyType;
  isEdit: boolean;
}

export const CostPolicyForm: FC<CostPolicyFormProps> = (props) => {
  const currentOrganization = useSelector(getCustomer);

  const [selectedEntities, setSelectedEntities] = useState<any[]>(
    props.isEdit && Array.isArray(props.initialValues?.scope)
      ? props.initialValues.scope
      : [],
  );

  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(
    props.isEdit && typeof props.initialValues?.period === 'number'
      ? props.initialValues.period
      : null,
  );

  const [selectedAction, setSelectedAction] = useState<Option | null>(
    typeof props.initialValues?.actions === 'string'
      ? {
          value: props.initialValues.actions,
          label: props.initialValues.actions,
        }
      : props.initialValues?.actions || null,
  );

  const [costsData, setCostsData] = useState<any[]>([]);

  useEffect(() => {
    if (selectedEntities.length && selectedPeriod) {
      Promise.all(
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
      ).then((costs) => {
        setCostsData(
          costs.map((cost, index) => {
            const previousMonths = cost.total_price
              ? parseFloat(cost.total_price)
              : 0;
            const currentMonth = parseFloat(
              selectedEntities[index].billing_price_estimate.current || 0,
            );
            const total = parseFloat(
              (previousMonths + currentMonth).toFixed(2),
            );
            return {
              name:
                props.type === 'project'
                  ? selectedEntities[index].name
                  : selectedEntities[index].name,
              previous_months: previousMonths,
              current_month: currentMonth,
              total,
            };
          }),
        );
      });
    }
  }, [selectedEntities, selectedPeriod, props.type]);

  const handleActionChange = (value) => {
    setSelectedAction(value);
    props.change('options', {});
  };

  return (
    <FormContainer submitting={props.submitting} className="size-lg">
      {props.type === 'project' ? (
        <AsyncSelectField
          name="scope"
          label={translate('Select project(s)')}
          validate={required}
          required
          placeholder={translate('Search and select project') + '...'}
          loadOptions={(query, prevOptions, { page }) =>
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
          onChange={(value) => {
            setSelectedEntities(value);
          }}
        />
      ) : (
        <AsyncSelectField
          name="scope"
          label={translate('Select organization(s)')}
          validate={required}
          required
          placeholder={translate('Search and select organization') + '...'}
          loadOptions={(query, prevOptions, { page }) =>
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
          onChange={(value) => {
            setSelectedEntities(value);
          }}
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
        onChange={(value) => setSelectedPeriod(value)}
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
        placeholder={
          translate('Select action to take when the condition is met') + '...'
        }
        validate={required}
        required
        options={getCostPolicyActionOptions(props.type)}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        onChange={(value) => handleActionChange(value)}
      />

      {selectedAction?.value === 'notify_external_user' && (
        <StringField
          name="options.notify_external_user"
          label={translate('External user emails')}
          placeholder={translate(
            'Enter email addresses separated by commas (e.g., user1@example.com, user2@example.com)',
          )}
          validate={[required, validateEmails]}
        />
      )}
      <Form.Group>
        <FieldError error={props.error} />
      </Form.Group>
    </FormContainer>
  );
};

const validateEmails = (value: string) => {
  if (!value) return translate('This field is required.');
  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  const emails = value.split(',').map((email) => email.trim());
  for (const email of emails) {
    if (email && !emailRegex.test(email)) {
      return translate('Invalid email: {email}', { email });
    }
  }
  return undefined;
};
