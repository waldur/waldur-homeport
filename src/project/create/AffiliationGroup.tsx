import { useCallback, useMemo } from 'react';
import { Field } from 'react-final-form';

import { Badge } from '@/core/Badge';
import { Select as AsyncPaginateSelect } from '@/form/AsyncSelectField';
import { translate } from '@/i18n';
import { affiliationAutocomplete } from '@/marketplace/common/autocompletes';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { Customer } from '@/workspace/types';

import { isAffiliationRequiredAtCreate } from './affiliationConfig';

interface AffiliationGroupProps {
  customer: Customer;
  isStaff: boolean;
}

export const AffiliationGroup = ({
  customer,
  isStaff,
}: AffiliationGroupProps) => {
  const required = isAffiliationRequiredAtCreate();

  const customerDefaultUuids = useMemo(
    () =>
      new Set(
        (customer?.default_affiliations ?? [])
          .map((o) => o.uuid)
          .filter((u): u is string => Boolean(u)),
      ),
    [customer],
  );

  const validate = (value) => {
    if (required && !value) {
      return translate('This field is required.');
    }
    return undefined;
  };

  const formatOptionLabel = (option: any) => (
    <span>
      {option.name}
      {option.abbreviation && (
        <span className="text-muted ms-2">({option.abbreviation})</span>
      )}
      {isStaff && customerDefaultUuids.has(option.uuid) && (
        <Badge variant="info" pill outline className="ms-2">
          {translate('Default')}
        </Badge>
      )}
    </span>
  );

  // Staff: full registry. Non-staff: server-side filtered to the customer's
  // default_affiliations via ?default_for_customer=<uuid>.
  const loadOptions = useCallback(
    (query, prevOptions, page) =>
      affiliationAutocomplete(
        query,
        prevOptions,
        page,
        isStaff ? undefined : { default_for_customer: customer?.uuid },
      ),
    [isStaff, customer],
  );

  return (
    <FormGroup label={translate('Affiliation')} required={required}>
      <Field
        name="affiliation"
        validate={validate}
        render={(fieldProps) => (
          <AsyncPaginateSelect
            {...fieldProps}
            // The cacheUniqs key makes AsyncPaginate re-fetch the first page
            // when the customer changes (the underlying default list differs).
            cacheUniqs={[customer?.uuid, isStaff]}
            placeholder={translate('Select an affiliation...')}
            loadOptions={loadOptions}
            defaultOptions
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.name}
            formatOptionLabel={formatOptionLabel}
            isClearable={!required}
            noOptionsMessage={() =>
              isStaff
                ? translate('No affiliations found.')
                : translate(
                    'No affiliations are configured for this organization.',
                  )
            }
          />
        )}
      />
    </FormGroup>
  );
};
