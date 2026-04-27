import { FC } from 'react';
import { ConflictOfInterest } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface COIExpandableRowProps {
  row: ConflictOfInterest;
}

const EvidenceDataDisplay: FC<{ data: unknown }> = ({ data }) => {
  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return null;
  }

  const renderValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return translate('None');
      return value.map((item) => renderValue(item)).join(', ');
    }
    if (typeof value === 'object') {
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${renderValue(val)}`)
        .join('; ');
    }
    if (typeof value === 'boolean') {
      return value ? translate('Yes') : translate('No');
    }
    return String(value);
  };

  return <span>{renderValue(data)}</span>;
};

export const COIExpandableRow: FC<COIExpandableRowProps> = ({ row }) => {
  const isReviewed = row.status !== 'pending';
  const isWaived = row.status === 'waived';

  return (
    <ExpandableContainer asTable>
      {/* Evidence */}
      <Field
        label={translate('Evidence description')}
        value={row.evidence_description}
      />
      <Field
        label={translate('Evidence data')}
        value={<EvidenceDataDisplay data={row.evidence_data} />}
      />

      {/* Conflicting party */}
      <Field
        label={translate('Conflicting person')}
        value={row.conflicting_user_name}
      />
      <Field
        label={translate('Conflicting organization')}
        value={row.conflicting_organization_name}
      />

      {/* Review information (only if reviewed) */}
      {isReviewed && (
        <>
          <Field
            label={translate('Reviewed by')}
            value={row.reviewed_by_name}
          />
          <Field
            label={translate('Reviewed at')}
            value={row.reviewed_at ? formatDateTime(row.reviewed_at) : null}
          />
          <Field label={translate('Review notes')} value={row.review_notes} />
        </>
      )}

      {/* Management plan (only if waived) */}
      {isWaived && (
        <Field
          label={translate('Management plan')}
          value={row.management_plan}
        />
      )}
    </ExpandableContainer>
  );
};
