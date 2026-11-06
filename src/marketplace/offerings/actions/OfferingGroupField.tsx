import { useMemo } from 'react';

import { AsyncSelectGroup } from '@/form';
import { translate } from '@/i18n';
import { offeringGroupAutocomplete } from '@/marketplace/common/autocompletes';

/**
 * The offering group picker, offering only the groups of one organization:
 * a group holds offerings of its own organization alone.
 */
export const OfferingGroupField = ({
  customerUuid,
  disabled,
  description,
  spaceless,
}: {
  customerUuid: string;
  disabled?: boolean;
  description?: string;
  spaceless?: boolean;
}) => {
  const loadOfferingGroups = useMemo(
    () => offeringGroupAutocomplete({ customer_uuid: customerUuid }),
    [customerUuid],
  );
  return (
    <AsyncSelectGroup
      name="offering_group"
      label={translate('Offering group')}
      description={description}
      placeholder={translate('Select a group or leave empty…')}
      loadOptions={loadOfferingGroups}
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.title}
      isClearable
      disabled={disabled}
      spaceless={spaceless}
    />
  );
};
