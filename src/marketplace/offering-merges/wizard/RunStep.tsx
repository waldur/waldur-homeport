import { FC, useEffect, useState } from 'react';
import { OfferingMerge, OfferingMergeRefusal } from 'waldur-js-client';

import { AlertItem, PropertyCard, PropertyItem, PropertyList } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import { ExecuteMergeButton } from '../actions';
import { DETAILS_STATE } from '../constants';
import { getInvoicePolicyOptions } from '../InvoicePolicy';
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
    <div className="flex flex-col gap-4">
      <PropertyCard>
        <PropertyList>
          <PropertyItem
            label={translate('State')}
            value={<OfferingMergeStateBadge state={merge.state} />}
          />
          <PropertyItem
            label={translate('Sources')}
            value={propVal.list(
              merge.source_offerings.map((offering) => offering.name),
            )}
          />
          <PropertyItem
            label={translate('Target')}
            value={merge.target_offering?.name}
          />
          <PropertyItem
            label={translate('Resources to move')}
            value={propVal.count(merge.preview?.counts?.[RESOURCE_COUNT_KEY])}
          />
          <PropertyItem
            label={translate('Invoice policy')}
            value={propVal.enum(merge.invoice_policy ?? 'open_month', {
              options: getInvoicePolicyOptions(),
            })}
          />
          <PropertyItem
            label={translate('Warnings acknowledged')}
            value={propVal.meter(
              warnings.length - missing.length,
              warnings.length,
              { showPercent: true },
            )}
          />
        </PropertyList>
      </PropertyCard>

      {!settled && (
        <div className="flex flex-col gap-2.5 items-start">
          <p className="text-quaternary mb-0">
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
