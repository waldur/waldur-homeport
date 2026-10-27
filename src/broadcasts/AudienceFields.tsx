import { FC, useMemo } from 'react';
import { useField } from 'react-final-form';

import { FormText } from 'waldur-ui';

import { AsyncSelectGroup, BooleanGroup } from '@/form';
import { translate } from '@/i18n';
import {
  organizationAutocomplete,
  providerOfferingsAutocomplete,
} from '@/marketplace/common/autocompletes';

export const AudienceFields: FC<{ allUsersLabel: string; hint?: string }> = ({
  allUsersLabel,
  hint,
}) => {
  const allUsers = useField('all_users', { subscription: { value: true } })
    .input.value;
  const loadOptions = useMemo(
    () => providerOfferingsAutocomplete({ shared: true }),
    [],
  );
  const loadOrganizations = useMemo(
    () =>
      organizationAutocomplete({
        field: ['name', 'uuid'],
        o: 'name',
      }),
    [],
  );
  return (
    <>
      <BooleanGroup name="all_users" label={allUsersLabel} hideLabel={true} />

      {/* Ignored while everyone is targeted. */}
      {!allUsers && (
        <>
          <AsyncSelectGroup
            label={translate('Offerings')}
            description={translate('Select specific offerings to target')}
            name="offerings"
            placeholder={translate('Select offerings...')}
            loadOptions={loadOptions}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.uuid}
            noOptionsMessage={() => translate('No offerings found')}
            isMulti={true}
          />

          <AsyncSelectGroup
            label={translate('Organizations')}
            description={translate('Select specific organizations to target')}
            name="customers"
            placeholder={translate('Select organizations...')}
            loadOptions={loadOrganizations}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.uuid}
            noOptionsMessage={() => translate('No organizations found')}
            isMulti={true}
          />
          {hint && <FormText className="mb-5">{hint}</FormText>}
        </>
      )}
    </>
  );
};
