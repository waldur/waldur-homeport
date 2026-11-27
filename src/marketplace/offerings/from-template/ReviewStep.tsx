import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { useFormState } from 'react-final-form';
import {
  marketplaceOfferingTemplatesCreateOffering,
  OfferingTemplateCreateOfferingResponse,
} from 'waldur-js-client';

import { AlertItem, BaseButton, PropertyItem, PropertyList } from 'waldur-ui';
import { WizardModal, WizardStepProps } from 'waldur-wizard';

import { ConfigurationFindingsTable } from '@/administration/offering-templates/OfferingTemplateFindings';
import { defaultCurrency } from '@/core/formatCurrency';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { getBillingTypeLabel } from '@/marketplace/common/billingTypes';
import {
  AGENT_ROLE_FIELDS,
  getRoleLabels,
} from '@/marketplace/offerings/update/integration/agentConfiguration';
import { propVal } from '@/property/propertyFields';
import { SimpleTable } from '@/table/SimpleTable';

import {
  useAskedBackendSettings,
  useSiteAgentPlugins,
} from './backendSettings';
import { CreateFromTemplateFormData } from './types';
import { buildCreateRequest, describeCreateRefusal } from './utils';

interface DocumentComponent {
  type: string;
  name?: string;
  billing_type?: string;
  measured_unit?: string;
}

interface DocumentPlan {
  name: string;
  unit?: string;
  components?: { component_type: string; amount?: number; price?: unknown }[];
}

interface PriceRow {
  key: string;
  plan: string;
  unit?: string;
  component: string;
  price: unknown;
}

/** The customer the offering is created for: the service provider picked,
 * or the organization the wizard was opened in. */
export const getCustomerUuid = (
  values: CreateFromTemplateFormData,
  data?: { customerUuid?: string },
) => values.organisation?.uuid ?? data?.customerUuid;

const ResolvedOffering: FC<{
  result: OfferingTemplateCreateOfferingResponse;
}> = ({ result }) => {
  const components = (result.document.components ?? []) as DocumentComponent[];
  const names = Object.fromEntries(
    components.map((component) => [
      component.type,
      component.name || component.type,
    ]),
  );
  const prices: PriceRow[] = (
    (result.document.plans ?? []) as DocumentPlan[]
  ).flatMap((plan) =>
    (plan.components ?? []).map((item) => ({
      key: `${plan.name}/${item.component_type}`,
      plan: plan.name,
      unit: plan.unit,
      component: names[item.component_type] ?? item.component_type,
      price: item.price,
    })),
  );
  return (
    <>
      <h3 className="text-base font-semibold mt-6 mb-2">
        {translate('Components')}
      </h3>
      <SimpleTable<DocumentComponent>
        rowKey="type"
        rows={components}
        columns={[
          {
            title: translate('Name'),
            rowHeader: true,
            render: ({ row }) => row.name || row.type,
          },
          { title: translate('Type'), render: ({ row }) => row.type },
          {
            title: translate('Billing'),
            render: ({ row }) =>
              row.billing_type ? getBillingTypeLabel(row.billing_type) : null,
          },
          {
            title: translate('Unit'),
            render: ({ row }) => row.measured_unit,
          },
        ]}
      />
      <h3 className="text-base font-semibold mt-6 mb-2">
        {translate('Plans and prices')}
      </h3>
      <SimpleTable<PriceRow>
        rowKey="key"
        rows={prices}
        columns={[
          {
            title: translate('Plan'),
            rowHeader: true,
            render: ({ row }) => row.plan,
          },
          { title: translate('Component'), render: ({ row }) => row.component },
          {
            title: translate('Price'),
            render: ({ row }) =>
              row.price === undefined || row.price === null
                ? translate('Not set')
                : defaultCurrency(row.price),
          },
        ]}
      />
    </>
  );
};

// A value left blank takes the parameter's default on the server, which
// the field already showed; a blank one without a default is left out.
const formatParameterValue = (value: unknown) =>
  value === undefined || value === null || value === ''
    ? undefined
    : typeof value === 'boolean'
      ? propVal.boolean(value)
      : String(value);

export const ReviewStep: FC<WizardStepProps> = (props) => {
  const { values } = useFormState<CreateFromTemplateFormData>();
  const roleLabels = getRoleLabels();
  const { data: plugins } = useSiteAgentPlugins();
  const asked = useAskedBackendSettings(
    plugins,
    values.agent_roles,
    values.template,
  );
  const settingTitles = Object.fromEntries(
    asked.flatMap(({ backend, settings }) =>
      settings.map((setting) => [
        setting.key,
        translate('{setting} ({backend})', {
          setting: setting.title,
          backend,
        }),
      ]),
    ),
  );
  const customerUuid = getCustomerUuid(values, props.data);
  const request = useMemo(
    () => buildCreateRequest(values, customerUuid, true),
    [values, customerUuid],
  );
  // Keyed by what is sent: going back and changing a value checks again.
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: [
      'offering-template-dry-run',
      values.template?.uuid,
      JSON.stringify(request),
    ],
    queryFn: () =>
      marketplaceOfferingTemplatesCreateOffering({
        path: { uuid: values.template.uuid },
        body: request,
      }).then((response) => response.data),
    retry: false,
    refetchOnWindowFocus: false,
    gcTime: 0,
  });

  const errors = (data?.findings ?? []).filter(
    (finding) => finding.severity === 'error',
  );
  const refusal = error ? describeCreateRefusal(error) : [];
  const blocked = isFetching || Boolean(error) || errors.length > 0;

  const summary = (
    <PropertyList variant="summary" className="mt-5">
      <PropertyItem
        label={translate('Template')}
        value={translate('{name}, version {version}', {
          name: values.template?.name,
          version: values.template?.version,
        })}
      />
      {values.organisation ? (
        <PropertyItem
          label={translate('Service provider')}
          value={values.organisation.name}
        />
      ) : null}
      <PropertyItem label={translate('Name')} value={values.name} />
      <PropertyItem
        label={translate('Category')}
        value={values.category?.title}
      />
      {(values.template?.parameters ?? []).map((parameter) => (
        <PropertyItem
          key={parameter.key}
          label={parameter.label || parameter.key}
          value={formatParameterValue(values.parameters?.[parameter.key])}
        />
      ))}
      {AGENT_ROLE_FIELDS.map(({ field }) => (
        <PropertyItem
          key={field}
          label={roleLabels[field]}
          value={values.agent_roles?.[field] || translate('Off')}
        />
      ))}
      {Object.entries(values.backend_settings ?? {}).map(([key, value]) => (
        <PropertyItem
          key={`backend-setting-${key}`}
          label={settingTitles[key] ?? key}
          value={formatParameterValue(value)}
        />
      ))}
    </PropertyList>
  );

  return (
    <WizardModal
      {...props}
      submitDisabled={blocked}
      submitTooltip={
        isFetching
          ? translate('Checking the offering…')
          : error
            ? translate('The check refused the offering: see above.')
            : errors.length
              ? translate('Resolve the errors before creating the offering.')
              : undefined
      }
    >
      <div data-testid="template-dry-run">
        {isFetching ? (
          <LoadingSpinner />
        ) : error ? (
          <AlertItem
            type="floating"
            variant="error"
            title={translate('The offering cannot be created as it is')}
            body={
              <ul className="list-disc ps-5 m-0">
                {refusal.map((line) => (
                  <li key={line} className="break-words">
                    {line}
                  </li>
                ))}
              </ul>
            }
            actions={
              <BaseButton
                variant="text-primary"
                label={translate('Check again')}
                onClick={() => refetch()}
              />
            }
          />
        ) : null}
        {!isFetching && error ? summary : null}
        {!isFetching && !error && data ? (
          <>
            {errors.length ? (
              <AlertItem
                type="floating"
                variant="error"
                title={translate(
                  'The site agent could not work with this offering. Go back and change the values or roles the errors name.',
                )}
              />
            ) : data.findings.length ? (
              <AlertItem
                type="floating"
                variant="warning"
                title={translate(
                  'The offering can be created; the warnings below may be intended.',
                )}
              />
            ) : (
              <AlertItem
                type="floating"
                variant="success"
                title={translate('The checks found nothing to fix.')}
              />
            )}
            {data.findings.length ? (
              <div className="mt-3">
                <ConfigurationFindingsTable findings={data.findings} />
              </div>
            ) : null}
            {data.warnings.length ? (
              <AlertItem
                className="mt-3"
                type="floating"
                variant="info"
                title={translate('Import notes')}
                body={
                  <ul className="list-disc ps-5 m-0">
                    {data.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                }
              />
            ) : null}
            {summary}
            <ResolvedOffering result={data} />
          </>
        ) : null}
      </div>
    </WizardModal>
  );
};
