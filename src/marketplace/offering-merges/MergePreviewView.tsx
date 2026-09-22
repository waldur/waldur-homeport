import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { OfferingMergeIssue, OfferingMergePreview } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

import { StaticTable } from './StaticTable';
import { formatCoverageLabel } from './utils';

interface PriceDifference {
  source_plan: string;
  component_type: string;
  source_price: string;
  target_price: string | null;
}

const PRICE_DIFFERENCE_CODE = 'plan_price_difference';

const getPriceDifferences = (warnings: OfferingMergeIssue[]) =>
  warnings
    .filter((warning) => warning.code === PRICE_DIFFERENCE_CODE)
    .flatMap(
      (warning) =>
        (warning.details?.components as PriceDifference[] | undefined) ?? [],
    );

const IssueCode: FC<{ code: string }> = ({ code }) => (
  <code className="fs-8 ms-2">{code}</code>
);

interface MergePreviewViewProps {
  preview: OfferingMergePreview;
  /** Plan names by uuid, to label price differences. */
  planNames?: Record<string, string>;
  /** Given, each warning gets a checkbox; omitted, the view is read-only. */
  acknowledged?: string[];
  onAcknowledge?(code: string, checked: boolean): void;
  tableId: string;
}

export const MergePreviewView: FC<MergePreviewViewProps> = ({
  preview,
  planNames = {},
  acknowledged,
  onAcknowledge,
  tableId,
}) => {
  const blockers = preview.blockers ?? [];
  const warnings = preview.warnings ?? [];
  const prices = getPriceDifferences(warnings);
  const counts = Object.entries(preview.counts ?? {}).filter(
    ([, count]) => count > 0,
  );
  const leftOnSource = Object.entries(preview.left_on_source ?? {}).filter(
    ([, count]) => count > 0,
  );

  return (
    <div className="d-flex flex-column gap-5">
      <section>
        <h4 className="mb-3">{translate('Blockers')}</h4>
        {blockers.length === 0 ? (
          <AlertItem
            variant="success"
            title={translate('Nothing blocks this merge.')}
          />
        ) : (
          <div className="d-flex flex-column gap-2">
            {blockers.map((blocker, index) => (
              <AlertItem
                key={`${blocker.code}-${index}`}
                variant="error"
                title={
                  <>
                    {blocker.message}
                    <IssueCode code={blocker.code} />
                  </>
                }
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h4 className="mb-3">{translate('Warnings')}</h4>
        {warnings.length === 0 ? (
          <p className="text-muted mb-0">{translate('No warnings.')}</p>
        ) : (
          <div className="d-flex flex-column gap-2">
            {warnings.map((warning, index) => (
              <AlertItem
                key={`${warning.code}-${index}`}
                variant="warning"
                title={
                  <>
                    {warning.message}
                    <IssueCode code={warning.code} />
                  </>
                }
                body={
                  onAcknowledge ? (
                    <Form.Check
                      type="checkbox"
                      id={`${tableId}-ack-${warning.code}`}
                      label={translate('I understand the consequences.')}
                      checked={acknowledged?.includes(warning.code) ?? false}
                      onChange={(event) =>
                        onAcknowledge(warning.code, event.target.checked)
                      }
                    />
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </section>

      {prices.length > 0 && (
        <StaticTable<PriceDifference>
          table={`${tableId}-prices`}
          title={translate('Price differences')}
          verboseName={translate('Price differences')}
          rows={prices}
          columns={[
            {
              title: translate('Source plan'),
              render: ({ row }) => (
                <>{planNames[row.source_plan] ?? row.source_plan}</>
              ),
            },
            {
              title: translate('Component'),
              render: ({ row }) => <>{row.component_type}</>,
            },
            {
              title: translate('Current price'),
              render: ({ row }) => <>{row.source_price}</>,
            },
            {
              title: translate('Price after merge'),
              render: ({ row }) => <>{renderFieldOrDash(row.target_price)}</>,
            },
          ]}
        />
      )}

      <section>
        <h4 className="mb-3">{translate('What moves to the target')}</h4>
        <FormTable.Card>
          <FormTable>
            {counts.length === 0 ? (
              <FormTable.Item
                label={translate('Rows')}
                value={translate('Nothing to move.')}
              />
            ) : (
              counts.map(([label, count]) => (
                <FormTable.Item
                  key={label}
                  label={formatCoverageLabel(label)}
                  value={count}
                />
              ))
            )}
          </FormTable>
        </FormTable.Card>
      </section>

      {leftOnSource.length > 0 && (
        <section>
          <h4 className="mb-3">{translate('What stays on the sources')}</h4>
          <FormTable.Card>
            <FormTable>
              {leftOnSource.map(([label, count]) => (
                <FormTable.Item
                  key={label}
                  label={formatCoverageLabel(label)}
                  value={count}
                />
              ))}
            </FormTable>
          </FormTable.Card>
        </section>
      )}

      <section>
        <h4 className="mb-3">{translate('Invoices and usage summaries')}</h4>
        <FormTable.Card>
          <FormTable>
            <FormTable.Item
              label={translate('Invoice items rewritten')}
              value={preview.invoice_items?.to_rewrite ?? 0}
            />
            <FormTable.Item
              label={translate('Items on closed invoices')}
              value={preview.invoice_items?.on_closed_invoices ?? 0}
            />
            <FormTable.Item
              label={translate('Closed-invoice items kept as they are')}
              value={preview.invoice_items?.kept_on_closed_invoices ?? 0}
            />
            <FormTable.Item
              label={translate('Usage summaries recomputed')}
              value={translate('{components} component(s) over {months}', {
                components: preview.summaries_to_recompute?.components ?? 0,
                months: renderFieldOrDash(
                  preview.summaries_to_recompute?.periods?.join(', '),
                ),
              })}
            />
          </FormTable>
        </FormTable.Card>
      </section>
    </div>
  );
};
