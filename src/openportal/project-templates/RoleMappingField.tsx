import classNames from 'classnames';
import { debounce } from 'lodash';
import React, {
  useState,
  FunctionComponent,
  useCallback,
  useMemo,
} from 'react';
import { Form } from 'react-bootstrap';
import { rolesList } from 'waldur-js-client';

import { parseSelectData } from '@/core/api';
import { ENV } from '@/core/config';
import { returnReactSelectAsyncPaginateObject } from '@/core/utils';
import { AsyncPaginate } from '@/form/themed-select';
import { FormField } from '@/form/types';
import { translate } from '@/i18n';

interface RoleMapping {
  [key: string]: any;
}

interface RoleMappingFieldProps extends FormField {
  placeholder?: string;
  validator?: any;
  solid?: boolean;
  debounceMs?: number;
}

const roleAutocomplete = async (query: string, prevOptions, { page }) => {
  const response = await rolesList({
    query: {
      name: query,
      page: page,
      page_size: ENV.pageSize,
      field: ['uuid', 'name', 'description'],
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    page,
  );
};

export const RoleMappingField: FunctionComponent<RoleMappingFieldProps> = ({
  input,
  placeholder,
  solid,
  meta,
  debounceMs,
}) => {
  const [remoteRoleName, setRemoteRoleName] = useState<string>('');
  const [localRole, setLocalRole] = useState<any>(null);

  const debouncedRoleAutocomplete = useMemo(
    () =>
      debounce(
        (query: string, prevOptions: any, page: { page: number }, resolve) => {
          roleAutocomplete(query, prevOptions, page).then(resolve);
        },
        debounceMs || 1000,
      ),
    [debounceMs],
  );

  const loadRoleOptions = useCallback(
    (query: string, prevOptions: any, { page }: { page: number }) => {
      return new Promise((resolve) => {
        debouncedRoleAutocomplete(query, prevOptions, { page }, resolve);
      });
    },
    [debouncedRoleAutocomplete],
  );

  const addMapping = useCallback(() => {
    if (remoteRoleName.trim() && localRole) {
      const currentMappings: RoleMapping = input.value || {};
      const newMappings = {
        ...currentMappings,
        [remoteRoleName.trim()]: localRole,
      };

      input.onChange(newMappings);
      setRemoteRoleName('');
      setLocalRole(null);
    }
  }, [remoteRoleName, localRole, input]);

  const removeMapping = useCallback(
    (key: string) => {
      const currentMappings: RoleMapping = input.value || {};
      if (currentMappings[key]) {
        const { [key]: _, ...remainingMappings } = currentMappings;
        input.onChange(remainingMappings);
      }
    },
    [input],
  );

  const handleRemoteRoleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRemoteRoleName(e.target.value);
    },
    [],
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addMapping();
      }
    },
    [addMapping],
  );

  const currentMappings: RoleMapping = input.value || {};
  const hasMappings = Object.keys(currentMappings).length > 0;
  const isAddButtonEnabled = remoteRoleName.trim() && localRole;

  const hasError = meta?.touched && meta?.error;

  return (
    <div className="role-mapping-field">
      <div className="mb-3">
        {hasMappings ? (
          <>
            <div className="text-muted mb-2">
              {translate('Current mappings:')}
            </div>
            <ul className="list-group mb-3">
              {Object.entries(currentMappings).map(([key, value]) => (
                <li
                  key={key}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>
                    <strong>{key}</strong> →{' '}
                    {value?.description || value?.name || 'Selected Role'}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removeMapping(key)}
                    title={translate('Remove mapping')}
                    aria-label={translate('Remove mapping for {{key}}', {
                      key,
                    })}
                  >
                    {translate('Remove')}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="text-muted mb-3">
            {translate('No mappings added yet.')}
          </div>
        )}

        <div className="text-muted mb-2">{translate('Add a new mapping:')}</div>

        <div className="row mb-3 align-items-end">
          <div className="col-md-5">
            <Form.Label className="sr-only">
              {translate('Remote Role Name')}
            </Form.Label>
            <Form.Control
              className={classNames(
                solid && 'form-control-solid',
                hasError && 'is-invalid',
              )}
              type="text"
              value={remoteRoleName}
              onChange={handleRemoteRoleChange}
              onKeyDown={handleKeyPress}
              onBlur={(event) => input.onBlur(event)}
              placeholder={
                placeholder || translate('e.g., admin, user, viewer')
              }
              aria-label={translate('Enter remote role name')}
            />
          </div>
          <div className="col-md-5">
            <Form.Label className="sr-only">
              {translate('Local Role')}
            </Form.Label>
            <AsyncPaginate
              value={localRole}
              onChange={(option) => setLocalRole(option)}
              loadOptions={loadRoleOptions}
              defaultOptions
              getOptionValue={(option) => option}
              getOptionLabel={(option) => option.description || option.name}
              onBlur={(event) => input.onBlur(event)}
              className="metronic-select-container"
              classNamePrefix="metronic-select"
              placeholder={translate('Select local role...')}
              aria-label={translate('Select local role')}
              noOptionsMessage={() => translate('No roles found')}
              isClearable={true}
            />
          </div>
          <div className="col-md-2">
            <button
              type="button"
              className={`btn btn-sm ${
                isAddButtonEnabled ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              onClick={addMapping}
              disabled={!isAddButtonEnabled}
              title={translate('Add mapping')}
              aria-label={translate('Add role mapping')}
            >
              {translate('Add')}
            </button>
          </div>
        </div>

        {/* Display validation errors */}
        {hasError && (
          <div className="invalid-feedback d-block">{meta.error}</div>
        )}
      </div>
    </div>
  );
};
