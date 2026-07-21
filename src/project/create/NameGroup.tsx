import { useCallback } from 'react';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { StringGroup } from '@/form';
import { translate } from '@/i18n';

import {
  getProjectNameRestrictionHint,
  validateProjectName,
} from '../validators';

interface NameGroupProps {
  customer;
  loading?;
  error?;
  refetch?;
}

export const NameGroup = ({
  customer,
  loading,
  error,
  refetch,
}: NameGroupProps) => {
  // Validate function receives (value, allValues, meta)
  // Only run async validation when this field is active (focused)
  const validate = useCallback(
    (value, _allValues, meta) => {
      // Skip async validation if field is not active (user is typing in another field)
      if (meta && !meta.active) {
        return undefined;
      }
      return validateProjectName(value, { customer });
    },
    [customer],
  );
  const restrictionHint = getProjectNameRestrictionHint();
  return (
    <StringGroup
      label={translate('Project name')}
      required
      tooltip={restrictionHint}
      quickAction={
        error ? (
          <LoadingErred
            loadData={refetch}
            className="d-flex align-items-center gap-2 mb-1"
          />
        ) : loading ? (
          <div className="mb-2">
            <small className="text-muted me-2">
              {translate('Loading projects')}
            </small>
            <LoadingSpinnerSimple className="mb-2 w-20px h-20px" />
          </div>
        ) : null
      }
      name="name"
      placeholder={translate('e.g. Community Health Outreach')}
      description={translate('This name will be visible in accounting data.')}
      validate={validate}
    />
  );
};
