import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OfferingMerge } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { BaseButton } from '@/core/buttons/BaseButton';
import { translate } from '@/i18n';

import { MergePreviewView } from '../MergePreviewView';
import { isPreviewable, isPreviewCurrent } from '../utils';

interface PreviewStepProps {
  merge: OfferingMerge;
  planNames: Record<string, string>;
  acknowledged: string[];
  onAcknowledge(code: string, checked: boolean): void;
  onRunPreview(): void;
  running: boolean;
}

export const PreviewStep: FC<PreviewStepProps> = ({
  merge,
  planNames,
  acknowledged,
  onAcknowledge,
  onRunPreview,
  running,
}) => {
  const current = isPreviewCurrent(merge);
  const previewable = isPreviewable(merge.state);
  return (
    <div className="d-flex flex-column gap-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <p className="text-muted mb-0">
          {translate(
            'The preview counts what moves, lists what blocks the merge and what needs your acknowledgement. Changing a mapping discards it.',
          )}
        </p>
        {previewable && (
          <BaseButton
            label={current ? translate('Run again') : translate('Run preview')}
            variant={current ? 'tertiary' : 'primary'}
            iconNode={<ArrowsClockwiseIcon weight="bold" />}
            onClick={onRunPreview}
            pending={running}
          />
        )}
      </div>
      {current ? (
        <MergePreviewView
          preview={merge.preview}
          planNames={planNames}
          acknowledged={acknowledged}
          onAcknowledge={onAcknowledge}
          tableId={`OfferingMergeWizard-${merge.uuid}`}
        />
      ) : (
        <AlertItem
          variant="info"
          title={translate('No current preview')}
          body={translate(
            'Run the preview to see what the merge moves. It is required before the merge can run.',
          )}
        />
      )}
    </div>
  );
};
