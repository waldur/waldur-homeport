import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useRef, useMemo } from 'react';
import { Table } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';
import {
  invoiceItemsCustomerCostsForPeriodRetrieve,
  invoiceItemsProjectCostsForPeriodRetrieve,
  type InvoiceItemsProjectCostsForPeriodRetrieveData,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { defaultCurrency } from '@/core/formatCurrency';
import { composeValidators, required, validateEmails } from '@/core/validators';
import {
  SelectGroup,
  NumberGroup,
  StringGroup,
  AsyncSelectGroup,
  BooleanGroup,
} from '@/form';
import { translate } from '@/i18n';
import {
  organizationAutocomplete,
  projectAutocomplete,
  resourceAutocomplete,
} from '@/marketplace/common/autocompletes';
import { ProjectCostField } from '@/project/ProjectCostField';
import { useCustomer } from '@/workspace/hooks';

import { CostPolicyType } from './types';
import { getCostPolicyActionOptions, policyPeriodOptions } from './utils';

interface CostPolicyFormProps {
  type: CostPolicyType;
  isEdit: boolean;
}

export const CostPolicyForm: FC<CostPolicyFormProps> = (props) => {
  const currentOrganization = useCustomer();
  const { values } = useFormState({ subscription: { values: true } });

  const loadOrganizations = useMemo(
    () =>
      organizationAutocomplete({
        field: [
          'name',
          'uuid',
          'url',
          'customer_credit',
          'billing_price_estimate',
        ],
      }),
    [],
  );

  const loadProjects = useMemo(
    () =>
      projectAutocomplete(currentOrganization?.uuid, {
        field: [
          'name',
          'uuid',
          'url',
          'billing_price_estimate',
          'project_credit',
        ],
      }),
    [currentOrganization?.uuid],
  );

  const selectedEntities = values.scope || [];
  const selectedPeriod = values.period;
  const selectedAction = values.actions;

  // A policy can be narrowed to a single resource only when exactly one
  // project is selected (resource scoping is a project-level feature).
  const singleProject =
    props.type === 'project' && selectedEntities.length === 1;
  const selectedProjectUuid = singleProject
    ? selectedEntities[0].uuid
    : undefined;
  const isResourceScoped = Boolean(values.resource);
  const scopedResourceUuid =
    singleProject && values.resource ? values.resource.uuid : undefined;

  const loadResources = useMemo(
    () =>
      selectedProjectUuid
        ? resourceAutocomplete({
            project_uuid: selectedProjectUuid,
            field: ['name', 'uuid'],
          })
        : undefined,
    [selectedProjectUuid],
  );

  const { data: costsData = [] } = useQuery({
    queryKey: [
      'cost-policies-costs',
      props.type,
      selectedEntities.map((e) => e.uuid),
      selectedPeriod,
      scopedResourceUuid,
    ],
    queryFn: async () => {
      // Resource-scoped policy: show only the costs incurred by that resource,
      // mirroring what the policy actually measures. Split the current month
      // (period=1) out of the selected-period total using invoice-item actuals.
      if (scopedResourceUuid) {
        // `resource_uuid` is cast onto the query type: the published SDK may
        // still lag the backend param, and the cast keeps type-checking green
        // against both the current and regenerated SDK.
        const scopedQuery = (period: number) =>
          ({
            project_uuid: selectedEntities[0].uuid,
            resource_uuid: scopedResourceUuid,
            period,
          }) as InvoiceItemsProjectCostsForPeriodRetrieveData['query'];
        const [fullPeriod, currentPeriod] = await Promise.all([
          invoiceItemsProjectCostsForPeriodRetrieve({
            query: scopedQuery(selectedPeriod),
          }).then((r) => r.data),
          invoiceItemsProjectCostsForPeriodRetrieve({
            query: scopedQuery(policyPeriodOptions.oneMonth.value),
          }).then((r) => r.data),
        ]);
        const total = fullPeriod.total_price
          ? parseFloat(fullPeriod.total_price)
          : 0;
        const currentMonth = currentPeriod.total_price
          ? parseFloat(currentPeriod.total_price)
          : 0;
        const previousMonths = parseFloat(
          Math.max(total - currentMonth, 0).toFixed(2),
        );
        return [
          {
            name: values.resource.name,
            previous_months: previousMonths,
            current_month: currentMonth,
            total: parseFloat(total.toFixed(2)),
          },
        ];
      }

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
    <div className="size-lg">
      <FormWatcher />
      {props.type === 'project' ? (
        <AsyncSelectGroup
          name="scope"
          label={translate('Select project(s)')}
          validate={required}
          required
          placeholder={translate('Search and select project...')}
          loadOptions={loadProjects}
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
        <AsyncSelectGroup
          name="scope"
          label={translate('Select organization(s)')}
          validate={required}
          required
          placeholder={translate('Search and select organization...')}
          loadOptions={loadOrganizations}
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
      <SelectGroup
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
                {isResourceScoped
                  ? translate('Resource')
                  : props.type === 'project'
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
      {singleProject && (
        <AsyncSelectGroup
          key={selectedProjectUuid}
          name="resource"
          label={translate('Limit to resource (optional)')}
          description={translate(
            'Restrict this policy to a single resource. When set, only that resource is measured and its actions apply to it alone.',
          )}
          placeholder={translate('All resources in the project')}
          loadOptions={loadResources}
          isClearable
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.uuid}
          noOptionsMessage={() => translate('No resources')}
        />
      )}
      <NumberGroup
        label={translate('When estimated cost reaches')}
        name="limit_cost"
        placeholder={translate('Enter the cost threshold (e.g. 1000 EUR)')}
        validate={required}
        required={true}
        unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
      />
      {props.type === 'project' && (
        <BooleanGroup
          name="use_credit"
          label={translate('Account for available credit')}
          description={translate(
            'When enabled, available project or organization credit is subtracted before the limit is enforced. Disable to enforce the limit against the raw invoice cost.',
          )}
        />
      )}
      <SelectGroup
        name="actions"
        label={translate('Then')}
        description={
          isResourceScoped
            ? translate(
                "'Block creation of new resources' is not available for resource-scoped policies.",
              )
            : undefined
        }
        placeholder={translate(
          'Select action to take when the condition is met...',
        )}
        validate={required}
        required
        options={getCostPolicyActionOptions(props.type, isResourceScoped)}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
      />
      {selectedAction?.value === 'notify_external_user' && (
        <StringGroup
          name="options.notify_external_user"
          label={translate('External user emails')}
          placeholder={translate(
            'Enter email addresses separated by commas (e.g., user1@example.com, user2@example.com)',
          )}
          validate={composeValidators(required, validateEmails)}
        />
      )}
    </div>
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

  // Resource scoping is only valid for a single selected project — drop a
  // stale resource selection when the scope no longer resolves to one project.
  const scopeCount = (values.scope || []).length;
  useEffect(() => {
    if (scopeCount !== 1 && values.resource) {
      change('resource', null);
    }
  }, [scopeCount, values.resource, change]);

  // A resource-scoped policy cannot block creation of new resources.
  useEffect(() => {
    if (
      values.resource &&
      values.actions?.value === 'block_creation_of_new_resources'
    ) {
      change('actions', null);
    }
  }, [values.resource, values.actions, change]);

  return null;
};
