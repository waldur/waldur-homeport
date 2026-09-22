import { FC, useEffect, useState } from 'react';
import { OfferingMerge, OfferingMergeRefusal } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { Link } from '@/core/Link';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

import { ExecuteMergeButton } from '../actions';
import { DETAILS_STATE } from '../constants';
import { InvoicePolicyLabel } from '../InvoicePolicy';
import { MergeRefusalAlert } from '../MergeRefusal';
import { MergeProgress, MergeVerification } from '../MergeRunStatus';
import { OfferingMergeStateBadge } from '../OfferingMergeStateBadge';
import {
  getMissingAcknowledgements,
  isPreviewable,
  RESOURCE_COUNT_KEY,
} from '../utils';

interface RunStepProps {
  merge: OfferingMerge;
  acknowledged: string[];
  unsavedChanges: boolean;
}

export const RunStep: FC<RunStepProps> = ({
  merge,
  acknowledged,
  unsavedChanges,
}) => {
  const warnings = merge.preview?.warnings ?? [];
  const missing = getMissingAcknowledgements(warnings, acknowledged);
  const settled = !isPreviewable(merge.state);
  const [refusal, setRefusal] = useState<OfferingMergeRefusal | null>(null);
  // A refusal describes the record as it was; a new state or preview
  // makes it stale.
  const previewKey = JSON.stringify(merge.preview ?? null);
  useEffect(() => setRefusal(null), [merge.state, previewKey]);
  return (
    <div className="d-flex flex-column gap-5">
      <FormTable.Card>
        <FormTable>
          <FormTable.Item
            label={translate('State')}
            value={<OfferingMergeStateBadge state={merge.state} />}
          />
          <FormTable.Item
            label={translate('Sources')}
            value={merge.source_offerings
              .map((offering) => offering.name)
              .join(', ')}
          />
          <FormTable.Item
            label={translate('Target')}
            value={merge.target_offering?.name}
          />
          <FormTable.Item
            label={translate('Resources to move')}
            value={merge.preview?.counts?.[RESOURCE_COUNT_KEY] ?? 0}
          />
          <FormTable.Item
            label={translate('Invoice policy')}
            value={<InvoicePolicyLabel policy={merge.invoice_policy} />}
          />
          <FormTable.Item
            label={translate('Warnings acknowledged')}
            value={translate('{done} of {total}', {
              done: warnings.length - missing.length,
              total: warnings.length,
            })}
          />
        </FormTable>
      </FormTable.Card>

      {!settled && (
        <div className="d-flex flex-column gap-3 align-items-start">
          <p className="text-muted mb-0">
            {translate(
              'The merge runs in the background. This page follows its progress and can be reloaded or left at any time.',
            )}
          </p>
          <ExecuteMergeButton
            merge={merge}
            acknowledged={acknowledged}
            unsavedChanges={unsavedChanges}
            onRefused={setRefusal}
          />
        </div>
      )}

      <MergeRefusalAlert
        title={translate('The merge was refused')}
        refusal={refusal}
      />

      <MergeProgress merge={merge} />

      {merge.state === 'done' && (
        <AlertItem
          variant={merge.verification?.passed ? 'success' : 'warning'}
          title={
            merge.verification?.passed
              ? translate('The merge is done and verified.')
              : translate('The merge is done but its verification failed.')
          }
          actions={
            <Link state={DETAILS_STATE} params={{ merge_uuid: merge.uuid }}>
              {translate('Open merge record')}
            </Link>
          }
        />
      )}

      <MergeVerification merge={merge} />
    </div>
  );
};
