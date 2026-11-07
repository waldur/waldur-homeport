import { FC } from 'react';
import { OfferingDependent } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { translate } from '@/i18n';

interface OfferingDependentsWarningProps {
  dependents: OfferingDependent[];
  blocked?: boolean;
  /** Why the change was refused, when the backend said so. */
  conflict?: string;
  className?: string;
}

/**
 * What depends on the offering, plan or component: a warning while the change
 * is allowed, an error once it is refused.
 */
export const OfferingDependentsWarning: FC<OfferingDependentsWarningProps> = ({
  dependents,
  blocked,
  conflict,
  className,
}) => {
  if (!dependents.length && !conflict) {
    return null;
  }
  return (
    <AlertItem
      type="floating"
      variant={blocked || conflict ? 'error' : 'warning'}
      className={className}
      title={
        blocked || conflict
          ? translate('This change is refused')
          : translate('Calls depend on this')
      }
      body={
        <div className="flex flex-col gap-1">
          {dependents.map((dependent, index) => (
            <span key={index}>{dependent.summary}</span>
          ))}
          {conflict ? <span>{conflict}</span> : null}
        </div>
      }
      data-testid="offering-dependents-warning"
    />
  );
};
