import { FunctionComponent, useMemo, useState } from 'react';
import { FieldRenderProps } from 'react-final-form';

import { Checkbox, FormFieldset, FormLegend, FormText, Input } from 'waldur-ui';

import { translate } from '@/i18n';

import { GLOBAL_SCOPES, ScopeGroup } from '../scopeOptions';

interface CustomPermissionPickerProps extends FieldRenderProps<string[]> {
  groups: ScopeGroup[];
  /** The token is restricted to entities, which global scopes cannot be. */
  hasBindings: boolean;
}

/** Every permission the user may delegate, as checkboxes in their groups. */
export const CustomPermissionPicker: FunctionComponent<
  CustomPermissionPickerProps
> = ({ input, meta, groups, hasBindings }) => {
  const [search, setSearch] = useState('');
  const selected = useMemo(
    () => new Set<string>(input.value || []),
    [input.value],
  );

  const visibleGroups = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return groups;
    return groups
      .map((group) =>
        group.label.toLowerCase().includes(needle)
          ? group
          : {
              ...group,
              options: group.options.filter(
                (opt) =>
                  opt.label.toLowerCase().includes(needle) ||
                  opt.value.toLowerCase().includes(needle),
              ),
            },
      )
      .filter((group) => group.options.length > 0);
  }, [groups, search]);

  const toggle = (value: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(value);
    else next.delete(value);
    input.onChange(Array.from(next));
    input.onBlur();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2.5">
        <Input
          className="grow"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={translate('Search permissions...')}
          aria-label={translate('Search permissions')}
        />
        <span className="text-quaternary text-sm whitespace-nowrap">
          {translate('{count} selected', { count: selected.size })}
        </span>
      </div>
      <div className="max-h-100 overflow-y-auto border border-secondary rounded-lg p-3">
        {visibleGroups.length === 0 ? (
          <FormText variant="muted">
            {translate('No permissions match the search.')}
          </FormText>
        ) : (
          visibleGroups.map((group) => (
            <FormFieldset key={group.label} className="mb-3">
              <FormLegend>{group.label}</FormLegend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-1">
                {group.options.map((opt) => {
                  const isGlobal = GLOBAL_SCOPES.has(opt.value);
                  const blocked = isGlobal && hasBindings;
                  return (
                    <Checkbox
                      key={opt.value}
                      checked={selected.has(opt.value)}
                      onCheckedChange={(checked) => toggle(opt.value, checked)}
                      disabled={blocked && !selected.has(opt.value)}
                      tooltip={
                        blocked
                          ? translate(
                              'Global access cannot be combined with entity restrictions. Remove the restrictions in the Target step to grant it.',
                            )
                          : undefined
                      }
                      label={opt.label}
                    />
                  );
                })}
              </div>
            </FormFieldset>
          ))
        )}
      </div>
      {meta.touched && meta.error && (
        <FormText variant="danger">{meta.error}</FormText>
      )}
    </div>
  );
};
