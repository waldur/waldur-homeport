import { useMemo } from 'react';

import { required } from '@/core/validators';
import { AsyncSelectGroup, BooleanGroup } from '@/form';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';

/** The target organization and the permissions toggle of a move. */
export const MoveOfferingFields = ({
  submitting,
  spaceless,
}: {
  submitting: boolean;
  spaceless?: boolean;
}) => {
  const loadOrganizations = useMemo(
    () =>
      organizationAutocomplete({
        field: ['name', 'url'],
        o: 'name',
        is_service_provider: true,
      }),
    [],
  );
  return (
    <>
      <AsyncSelectGroup
        name="organization"
        label={translate('Move to service provider')}
        required
        validate={required}
        placeholder={translate('Select organization...')}
        loadOptions={loadOrganizations}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.url}
        noOptionsMessage={() => translate('No organizations')}
        isDisabled={submitting}
      />
      <BooleanGroup
        name="preserve_permissions"
        label={translate('Preserve offering permissions')}
        description={translate(
          'Keep existing offering permissions when moving to a new organization',
        )}
        spaceless={spaceless}
      />
    </>
  );
};
