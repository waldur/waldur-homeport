import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';

import { AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';

import { ENTITY_LOADERS } from './entityFetchers';

interface EntityScopePickerProps {
  type: string | null;
  value: { uuid: string; name: string } | null;
  onChange: (value: { uuid: string; name: string } | null) => void;
  isDisabled?: boolean;
}

/**
 * Async picker for a single entity of the chosen TYPE_MAP type.
 * Resets the selection when `type` changes — selecting "Customer" then switching
 * to "Project" must not keep the customer UUID around.
 */
export const EntityScopePicker: FunctionComponent<EntityScopePickerProps> = ({
  type,
  value,
  onChange,
  isDisabled,
}) => {
  // Reset the selected entity if the type changes underneath us.
  useEffect(() => {
    if (value && type && !ENTITY_LOADERS[type]) {
      onChange(null);
    }
  }, [type, value, onChange]);

  const loadOptions = useMemo(() => {
    if (!type || !ENTITY_LOADERS[type]) return null;
    return ENTITY_LOADERS[type];
  }, [type]);

  const handleChange = useCallback(
    (selected) => onChange(selected ?? null),
    [onChange],
  );

  if (!loadOptions) {
    return (
      <AsyncSelect
        isDisabled
        placeholder={translate('Pick a type first')}
        loadOptions={() => Promise.resolve({ options: [], hasMore: false })}
      />
    );
  }

  return (
    <AsyncSelect
      // Force remount when `type` changes so the cached options are dropped.
      key={type}
      value={value}
      onChange={handleChange}
      loadOptions={loadOptions}
      defaultOptions
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.name || option.customer_name}
      placeholder={translate('Search...')}
      noOptionsMessage={() => translate('No matches')}
      isClearable
      isDisabled={isDisabled}
    />
  );
};
