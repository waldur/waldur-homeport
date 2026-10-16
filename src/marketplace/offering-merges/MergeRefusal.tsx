import { FC } from 'react';
import { OfferingMergeRefusal } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { translate } from '@/i18n';

/**
 * The body of a refused execute or undo: 400 with blockers or missing
 * acknowledgements, 409 with only a detail. The SDK throws the parsed body;
 * an axios-style error carries it under response.data.
 */
export const getMergeRefusal = (
  error: unknown,
): OfferingMergeRefusal | null => {
  const body =
    (error as any)?.response?.data ?? (error as any)?.body ?? error ?? null;
  if (!body || typeof body !== 'object') {
    return null;
  }
  const { detail, blockers, missing_acknowledgements } = body as Record<
    string,
    unknown
  >;
  if (
    typeof detail !== 'string' &&
    !Array.isArray(blockers) &&
    !Array.isArray(missing_acknowledgements)
  ) {
    return null;
  }
  return {
    detail: typeof detail === 'string' ? detail : '',
    blockers: Array.isArray(blockers) ? blockers : [],
    missing_acknowledgements: Array.isArray(missing_acknowledgements)
      ? missing_acknowledgements
      : [],
  };
};

export const MergeRefusalAlert: FC<{
  title: string;
  refusal: OfferingMergeRefusal | null;
}> = ({ title, refusal }) => {
  if (!refusal) {
    return null;
  }
  const blockers = refusal.blockers ?? [];
  const missing = refusal.missing_acknowledgements ?? [];
  return (
    <AlertItem
      variant="error"
      title={title}
      body={
        <div className="flex flex-col gap-2" data-testid="merge-refusal">
          {refusal.detail && <span>{refusal.detail}</span>}
          {blockers.length > 0 && (
            <div>
              <div>{translate('Blockers')}</div>
              <ul className="mb-0">
                {blockers.map((blocker, index) => (
                  <li key={`${blocker.code}-${index}`}>
                    {blocker.message}{' '}
                    <code className="text-xs">{blocker.code}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {missing.length > 0 && (
            <div>
              <div>{translate('Warnings not acknowledged')}</div>
              <ul className="mb-0">
                {missing.map((code) => (
                  <li key={code}>
                    <code className="text-xs">{code}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      }
    />
  );
};
