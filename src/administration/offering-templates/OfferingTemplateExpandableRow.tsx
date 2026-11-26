import { FC, ReactNode } from 'react';
import { OfferingTemplate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { SimpleTable } from '@/table/SimpleTable';
import { renderFieldOrDash } from '@/table/utils';

import { OfferingTemplateFindingsTable } from './OfferingTemplateFindings';
import { OfferingTemplateParametersTable } from './OfferingTemplateParametersTable';
import { documentList } from './templateDocument';

type DocumentRow = Record<string, unknown>;

const field = (row: DocumentRow, key: string) =>
  renderFieldOrDash(
    row[key] === null || row[key] === undefined || row[key] === ''
      ? null
      : String(row[key]),
  );

const Section: FC<{
  title: string;
  empty: string;
  isEmpty: boolean;
  children: ReactNode;
}> = ({ title, empty, isEmpty, children }) => (
  <section aria-label={title} className="mb-5 last:mb-0">
    <h3 className="text-sm font-medium mb-2.5">{title}</h3>
    {isEmpty ? (
      <p className="text-quaternary text-sm mb-0">{empty}</p>
    ) : (
      children
    )}
  </section>
);

export const OfferingTemplateExpandableRow: FC<{ row: OfferingTemplate }> = ({
  row,
}) => {
  const components = documentList(row.document, 'components');
  const plans = documentList(row.document, 'plans');
  return (
    <ExpandableContainer>
      {row.description ? (
        <p className="text-quaternary mb-3">{row.description}</p>
      ) : null}
      {row.configuration_findings?.length ? (
        <Section
          title={translate('Consistency findings')}
          empty=""
          isEmpty={false}
        >
          <p className="text-quaternary text-sm mb-2.5">
            {translate(
              'What the site agent would do differently from what the template says. An offering cannot be created from a template with an error.',
            )}
          </p>
          <OfferingTemplateFindingsTable row={row} />
        </Section>
      ) : null}
      <Section
        title={translate('Components')}
        empty={translate('The template defines no components.')}
        isEmpty={!components.length}
      >
        <SimpleTable<DocumentRow>
          rowKey="type"
          rows={components}
          columns={[
            {
              title: translate('Type'),
              rowHeader: true,
              render: ({ row }) => field(row, 'type'),
            },
            {
              title: translate('Name'),
              render: ({ row }) => field(row, 'name'),
            },
            {
              title: translate('Measured unit'),
              render: ({ row }) => field(row, 'measured_unit'),
            },
            {
              title: translate('Billing type'),
              render: ({ row }) => field(row, 'billing_type'),
            },
          ]}
        />
      </Section>
      <Section
        title={translate('Plans')}
        empty={translate('The template defines no plans.')}
        isEmpty={!plans.length}
      >
        <SimpleTable<DocumentRow>
          rowKey="name"
          rows={plans}
          columns={[
            {
              title: translate('Name'),
              rowHeader: true,
              render: ({ row }) => field(row, 'name'),
            },
            {
              title: translate('Billing period'),
              render: ({ row }) => field(row, 'unit'),
            },
            {
              title: translate('Unit price'),
              render: ({ row }) => field(row, 'unit_price'),
            },
          ]}
        />
      </Section>
      <Section
        title={translate('Parameters')}
        empty={translate('The template declares no parameters.')}
        isEmpty={!row.parameters?.length}
      >
        <OfferingTemplateParametersTable
          parameters={row.parameters ?? []}
          scrollable={false}
        />
      </Section>
    </ExpandableContainer>
  );
};
