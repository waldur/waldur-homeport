import { FC } from 'react';
import { OfferingMerge, ProviderOfferingDetails } from 'waldur-js-client';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

import { InvoicePolicyLabel } from './InvoicePolicy';
import { StaticTable } from './StaticTable';

/** What the mapping section is for, shown on every heading that names it. */
export const getMappingsHelp = () =>
  translate(
    'Which source plan and component each target plan and component takes over. The merge is refused while anything a moved row uses is left unmapped.',
  );

type Offerings = Record<string, ProviderOfferingDetails>;

export const getPlanNames = (offerings: Offerings = {}) =>
  Object.fromEntries(
    Object.values(offerings).flatMap((offering) =>
      (offering.plans ?? []).map((plan) => [plan.uuid, plan.name]),
    ),
  ) as Record<string, string>;

const getComponentName = (
  offering: ProviderOfferingDetails | undefined,
  type: string,
) =>
  offering?.components?.find((component) => component.type === type)?.name ??
  type;

interface MappingRow {
  uuid: string;
  offering: string;
  source: string;
  target: string;
}

export const MergeMappingsView: FC<{
  merge: OfferingMerge;
  offerings?: Offerings;
}> = ({ merge, offerings = {} }) => {
  const planNames = getPlanNames(offerings);
  const planOffering = Object.fromEntries(
    Object.values(offerings).flatMap((offering) =>
      (offering.plans ?? []).map((plan) => [plan.uuid, offering.name]),
    ),
  );
  const target = offerings[merge.target];

  const planRows: MappingRow[] = Object.entries(merge.plan_mapping ?? {}).map(
    ([source, targetPlan]) => ({
      uuid: source,
      offering: planOffering[source] ?? '',
      source: planNames[source] ?? source,
      target: planNames[targetPlan] ?? targetPlan,
    }),
  );
  const componentRows: MappingRow[] = Object.entries(
    merge.component_mapping ?? {},
  ).flatMap(([offeringUuid, mapping]) =>
    Object.entries(mapping).map(([sourceType, targetType]) => ({
      uuid: `${offeringUuid}-${sourceType}`,
      offering:
        offerings[offeringUuid]?.name ??
        merge.source_offerings.find((o) => o.uuid === offeringUuid)?.name ??
        offeringUuid,
      source: getComponentName(offerings[offeringUuid], sourceType),
      target: getComponentName(target, targetType),
    })),
  );
  const answerRows: MappingRow[] = Object.entries(
    merge.attribute_key_mapping ?? {},
  ).map(([oldKey, newKey]) => ({
    uuid: oldKey,
    offering: '',
    source: oldKey,
    target: newKey,
  }));

  const columns = (source: string, target: string, withOffering = true) => [
    ...(withOffering
      ? [
          {
            title: translate('Source offering'),
            render: ({ row }: { row: MappingRow }) => (
              <>{renderFieldOrDash(row.offering)}</>
            ),
          },
        ]
      : []),
    {
      title: source,
      render: ({ row }: { row: MappingRow }) => <>{row.source}</>,
    },
    {
      title: target,
      render: ({ row }: { row: MappingRow }) => <>{row.target}</>,
    },
  ];

  return (
    <div className="d-flex flex-column gap-5">
      <StaticTable<MappingRow>
        table={`OfferingMergePlans-${merge.uuid}`}
        title={translate('Plan mapping')}
        help={translate(
          'Which target plan each source plan becomes. A plan a moved resource or order uses must be mapped.',
        )}
        verboseName={translate('Plan mappings')}
        rows={planRows}
        columns={columns(translate('Source plan'), translate('Target plan'))}
      />
      <StaticTable<MappingRow>
        table={`OfferingMergeComponents-${merge.uuid}`}
        title={translate('Component mapping')}
        help={translate(
          'Which target component each source component becomes. A component used by usage, quotas or invoice lines must be mapped.',
        )}
        verboseName={translate('Component mappings')}
        rows={componentRows}
        columns={columns(
          translate('Source component'),
          translate('Target component'),
        )}
      />
      <StaticTable<MappingRow>
        table={`OfferingMergeAnswers-${merge.uuid}`}
        title={translate('Order answer keys')}
        help={translate(
          'Which key of the target order form each source key is renamed to, so past answers keep their meaning.',
        )}
        verboseName={translate('Answer key renames')}
        rows={answerRows}
        columns={columns(translate('Old key'), translate('New key'), false)}
      />
      <FormTable.Card title={translate('Invoices')}>
        <FormTable>
          <FormTable.Item
            label={translate('Invoice policy')}
            value={<InvoicePolicyLabel policy={merge.invoice_policy} />}
          />
        </FormTable>
      </FormTable.Card>
    </div>
  );
};
