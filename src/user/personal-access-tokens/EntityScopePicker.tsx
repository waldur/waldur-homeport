import { FunctionComponent, useCallback, useMemo } from 'react';
import { BindableEntity } from 'waldur-js-client';

import { AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';

import { createBindableEntityLoader } from './entityFetchers';

interface EntityScopePickerProps {
  type: string | null;
  value: { uuid: string; name: string } | null;
  onChange: (value: { uuid: string; name: string } | null) => void;
  isDisabled?: boolean;
  'aria-label'?: string;
}

const getEntityLabel = (entity: BindableEntity) =>
  entity.context ? `${entity.name} (${entity.context})` : entity.name;

/**
 * Picks one entity of the chosen type that the user can restrict a token
 * to. The type's row resets the entity when the type changes.
 */
export const EntityScopePicker: FunctionComponent<EntityScopePickerProps> = ({
  type,
  value,
  onChange,
  isDisabled,
  'aria-label': ariaLabel,
}) => {
  const loadOptions = useMemo(
    () => (type ? createBindableEntityLoader(type) : null),
    [type],
  );

  const handleChange = useCallback(
    (selected) => onChange(selected ?? null),
    [onChange],
  );

  if (!loadOptions) {
    return (
      <AsyncSelect
        isDisabled
        aria-label={ariaLabel}
        placeholder={translate('Pick a type first')}
        loadOptions={() => Promise.resolve({ options: [], hasMore: false })}
      />
    );
  }

  return (
    <AsyncSelect
      // Force remount when `type` changes so the cached options are dropped.
      key={type}
      aria-label={ariaLabel}
      value={value}
      onChange={handleChange}
      loadOptions={loadOptions}
      defaultOptions
      getOptionValue={(option: BindableEntity) => option.uuid}
      getOptionLabel={getEntityLabel}
      placeholder={translate('Search...')}
      noOptionsMessage={({ inputValue }) =>
        inputValue
          ? translate('No matches')
          : translate('No entities you can restrict a token to')
      }
      isClearable
      isDisabled={isDisabled}
    />
  );
};
