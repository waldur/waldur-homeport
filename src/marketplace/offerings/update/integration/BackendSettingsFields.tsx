import { FC, ReactNode, useState } from 'react';
import { FieldRenderProps } from 'react-final-form';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  PropertyList,
} from 'waldur-ui';

import { required as requiredValidator } from '@/core/validators';
import { FormGroup } from '@/form';
import {
  NumberEditField,
  SelectEditField,
  StringEditField,
  withEditField,
} from '@/form/editFields';
import { FieldError } from '@/form/FieldError';
import { FilterBox } from '@/form/FilterBox';
import { NumberField } from '@/form/NumberField';
import { SelectField } from '@/form/select/SelectField';
import { StringField } from '@/form/StringField';
import { SwitchField } from '@/form/SwitchField';
import { TextField } from '@/form/TextField';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import {
  BackendSetting,
  filterSettingGroups,
  getSettingInitialValue,
  groupBackendSettings,
  isSettingUnset,
  SettingGroup,
} from './backendSettingsSchema';
import { JsonValueEditField, jsonValueValidator } from './JsonObjectField';
import { StateSwitchEditField } from './StateSwitchField';

const settingOptions = (setting: BackendSetting) =>
  (setting.options ?? []).map((option) => ({
    value: option,
    label: String(option),
  }));

// A value as its kind reads; the row draws the dash for a missing one.
const formatSetting = (setting: BackendSetting, value: unknown): ReactNode => {
  switch (setting.kind) {
    case 'boolean':
      return propVal.boolean(Boolean(value))?.node;
    case 'integer':
    case 'number':
      return propVal.number(value as number)?.node;
    case 'enum':
      return propVal.enum(value as string)?.node;
    case 'json':
      return propVal.json(value, { compact: true })?.node;
    default:
      return propVal.text(value as string)?.node;
  }
};

// A default as plain text, to read inside "default: …".
const defaultText = (setting: BackendSetting): string =>
  setting.kind === 'boolean'
    ? setting.default
      ? translate('Yes')
      : translate('No')
    : setting.kind === 'json'
      ? JSON.stringify(setting.default)
      : String(setting.default);

/** The stored value of a setting, or the default the agent uses for it. */
const renderSettingValue = (
  setting: BackendSetting,
  value: unknown,
): ReactNode => {
  if (!isSettingUnset(value)) {
    return formatSetting(setting, value);
  }
  if (setting.default !== undefined) {
    return (
      <span className="text-tertiary">
        {translate('default: {value}', { value: defaultText(setting) })}
      </span>
    );
  }
  return undefined;
};

/**
 * The edit field of one setting, by its kind, saved under
 * `agent_configuration.backend_settings.<key>`.
 */
const BackendSettingEditField: FC<{
  setting: BackendSetting;
  value: unknown;
  labelTooltip?: ReactNode;
}> = ({ setting, value, labelTooltip }) => {
  const common = {
    name: `agent_configuration.backend_settings.${setting.key}`,
    label: setting.title,
    description: setting.description,
    labelTooltip,
    required: setting.required,
    renderValue: () => renderSettingValue(setting, value),
  };
  const validate =
    setting.required && setting.kind !== 'boolean'
      ? requiredValidator
      : undefined;
  switch (setting.kind) {
    case 'boolean':
      return <StateSwitchEditField {...common} />;
    case 'integer':
    case 'number':
      return <NumberEditField {...common} validate={validate} />;
    case 'enum':
      return (
        <SelectEditField
          {...common}
          validate={validate}
          options={settingOptions(setting)}
          simpleValue
          isClearable={!setting.required}
          emptyValue={null}
        />
      );
    case 'json':
      return (
        <JsonValueEditField
          {...common}
          validate={(text) =>
            jsonValueValidator(text) ?? (validate ? validate(text) : undefined)
          }
          dialogSize="lg"
        />
      );
    default:
      return <StringEditField {...common} validate={validate} />;
  }
};

// "18 settings, 3 set".
const groupCount = (group: SettingGroup) =>
  group.settings.length === 1
    ? translate('1 setting, {set} set', { set: group.set })
    : translate('{count} settings, {set} set', {
        count: group.settings.length,
        set: group.set,
      });

const GroupTitle: FC<{ group: SettingGroup }> = ({ group }) => (
  <span>
    {group.title}
    <span className="font-normal text-tertiary">
      {' · '}
      {groupCount(group)}
    </span>
  </span>
);

/**
 * The settings of one backend, in groups: the required ones always open, the
 * others folded unless one of theirs is set. A search shows what matches in
 * every group, open; clearing it brings back the groups as they were.
 */
export const BackendSettingsBlock: FC<{
  backend: string;
  settings: BackendSetting[];
  commonKeys: Set<string>;
  values: Record<string, unknown>;
  labelTooltip?: ReactNode;
}> = ({ backend, settings, commonKeys, values, labelTooltip }) => {
  const groups = groupBackendSettings(backend, settings, commonKeys, values);
  const [query, setQuery] = useState('');
  const [openGroups, setOpenGroups] = useState<string[]>(() =>
    groups.filter((group) => group.open).map((group) => group.id),
  );
  const shown = filterSettingGroups(groups, query);
  const searching = query.trim() !== '';
  const renderRows = (rows: BackendSetting[]) => (
    <PropertyList>
      {rows.map((setting) => (
        <BackendSettingEditField
          key={setting.key}
          setting={setting}
          value={values[setting.key]}
          labelTooltip={labelTooltip}
        />
      ))}
    </PropertyList>
  );
  const required = shown.find((group) => group.id === 'required');
  const folding = shown.filter((group) => group.id !== 'required');
  return (
    <section data-testid={`backend-settings-${backend}`}>
      <p className="text-secondary text-sm mb-3">
        {translate(
          'From the plugin catalog. A setting left unset takes its default; secrets stay in the agent configuration file.',
        )}
      </p>
      {/* Sticks below the page's sticky bars, so the search stays in reach
          over a long list of settings and is never left under them. */}
      <div className="sticky top-[var(--layout-sticky-top,0px)] z-10 bg-card py-2 mb-2">
        <FilterBox
          type="search"
          placeholder={translate('Search settings')}
          aria-label={translate('Search settings')}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="max-w-80"
        />
      </div>
      {shown.length === 0 ? (
        <p className="text-tertiary">{translate('No settings match.')}</p>
      ) : null}
      {required ? (
        <div className="mb-4" data-testid="settings-group-required">
          <h3 className="text-sm font-semibold mb-1">
            <GroupTitle group={required} />
          </h3>
          {renderRows(required.settings)}
        </div>
      ) : null}
      {folding.length ? (
        <Accordion
          type="multiple"
          className="border border-secondary rounded-lg"
          value={searching ? folding.map((group) => group.id) : openGroups}
          onValueChange={(value: string[]) => {
            if (!searching) {
              setOpenGroups(value);
            }
          }}
        >
          {folding.map((group) => (
            <AccordionItem
              key={group.id}
              value={group.id}
              data-testid={`settings-group-${group.id}`}
            >
              <AccordionTrigger>
                <GroupTitle group={group} />
              </AccordionTrigger>
              <AccordionContent>{renderRows(group.settings)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : null}
    </section>
  );
};

/** A role's choice in its edit dialog: the backend and the settings it needs. */
export interface RoleChoice {
  backend: string | null;
  settings: Record<string, unknown>;
}

/** The dialog's value as a choice; it opens on the stored backend alone. */
export const toRoleChoice = (value: unknown): RoleChoice =>
  value && typeof value === 'object'
    ? (value as RoleChoice)
    : { backend: (value as string) || null, settings: {} };

/** The control of one setting the role dialog asks for. */
const SettingControl: FC<{
  setting: BackendSetting;
  value: unknown;
  onChange(value: unknown): void;
}> = ({ setting, value, onChange }) => {
  const input = {
    name: `settings.${setting.key}`,
    value: value ?? '',
    // A textarea hands over its change event, the others the value.
    onChange: (next: any) =>
      onChange(next?.target !== undefined ? next.target.value : next),
    onBlur: () => undefined,
    onFocus: () => undefined,
  } as any;
  const meta = {} as any;
  switch (setting.kind) {
    case 'boolean':
      return (
        <SwitchField
          input={{ ...input, value: Boolean(value) }}
          meta={meta}
          aria-label={setting.title}
        />
      );
    case 'integer':
    case 'number':
      return (
        <NumberField input={input} meta={meta} aria-label={setting.title} />
      );
    case 'enum':
      return (
        <SelectField
          input={input}
          meta={meta}
          options={settingOptions(setting)}
          simpleValue
          aria-label={setting.title}
        />
      );
    case 'json':
      return (
        <TextField
          input={{
            ...input,
            value:
              typeof value === 'string'
                ? value
                : value === undefined
                  ? ''
                  : JSON.stringify(value),
          }}
          meta={meta}
          aria-label={setting.title}
        />
      );
    default:
      return (
        <StringField input={input} meta={meta} aria-label={setting.title} />
      );
  }
};

// The missing settings by the backend that requires them, the chosen one
// first: a setting another role's backend needs is not the chosen one's.
const groupByBackend = (
  settings: BackendSetting[],
  chosen: string | null,
): [string, BackendSetting[]][] => {
  const groups = new Map<string, BackendSetting[]>();
  settings.forEach((setting) =>
    groups.set(setting.backend, [
      ...(groups.get(setting.backend) ?? []),
      setting,
    ]),
  );
  return [...groups.entries()].sort(
    ([a], [b]) => Number(b === chosen) - Number(a === chosen),
  );
};

type RoleBackendFieldProps = FieldRenderProps<any> & {
  options: { value: string; label: string }[];
  isClearable?: boolean;
  /** The required settings a role on this backend would still lack. */
  getMissingSettings(backend: string | null): BackendSetting[];
};

/**
 * A role's backend, and below it the required settings the chosen backend
 * lacks, so the role and its settings are saved in one request.
 */
const RoleBackendField: FC<RoleBackendFieldProps> = ({
  input,
  meta,
  options,
  isClearable,
  getMissingSettings,
}) => {
  const choice = toRoleChoice(input.value);
  const missing = getMissingSettings(choice.backend);
  return (
    <>
      <SelectField
        input={{
          ...input,
          value: choice.backend,
          onChange: (backend: string | null) =>
            input.onChange({
              backend,
              settings: Object.fromEntries(
                getMissingSettings(backend).map((setting) => [
                  setting.key,
                  getSettingInitialValue(setting),
                ]),
              ),
            }),
        }}
        meta={meta}
        options={options}
        simpleValue
        isClearable={isClearable}
      />
      {missing.length ? (
        <div className="mt-5" data-testid="role-required-settings">
          {groupByBackend(missing, choice.backend).map(
            ([backend, settings]) => (
              <div key={backend} className="mb-3">
                <p className="text-secondary mb-3">
                  {backend === choice.backend
                    ? translate(
                        '{backend} needs these settings, which are not set yet. They are saved with the backend.',
                        { backend },
                      )
                    : translate(
                        '{backend}, which the other roles keep using, needs these settings, which are not set yet. They are saved with the backend.',
                        { backend },
                      )}
                </p>
                {settings.map((setting) => (
                  <FormGroup
                    key={setting.key}
                    label={setting.title}
                    description={setting.description}
                    required
                  >
                    <SettingControl
                      setting={setting}
                      value={choice.settings[setting.key]}
                      onChange={(value) =>
                        input.onChange({
                          ...choice,
                          settings: {
                            ...choice.settings,
                            [setting.key]: value,
                          },
                        })
                      }
                    />
                  </FormGroup>
                ))}
              </div>
            ),
          )}
        </div>
      ) : null}
      {meta.error && meta.dirty ? <FieldError error={meta.error} /> : null}
    </>
  );
};

/**
 * Why a role's choice cannot be saved: a required setting left empty, or
 * JSON that does not parse, naming the settings.
 */
export const validateRoleChoice =
  (getMissingSettings: (backend: string | null) => BackendSetting[]) =>
  (value: unknown): string | undefined => {
    if (!value || typeof value !== 'object') {
      return undefined;
    }
    const choice = toRoleChoice(value);
    const missing = getMissingSettings(choice.backend);
    // A required setting the user is asked for needs something typed.
    const empty = missing.filter((setting) => {
      const typed = choice.settings[setting.key];
      return isSettingUnset(typed) || typed === '';
    });
    if (empty.length) {
      return translate('Enter the required settings: {settings}.', {
        settings: empty.map((setting) => setting.title).join(', '),
      });
    }
    const invalid = missing.filter(
      (setting) =>
        setting.kind === 'json' &&
        jsonValueValidator(choice.settings[setting.key]),
    );
    if (invalid.length) {
      return translate('Not valid JSON: {settings}.', {
        settings: invalid.map((setting) => setting.title).join(', '),
      });
    }
    return undefined;
  };

/** A role's backend selector whose dialog also asks for missing settings. */
export const RoleBackendEditField = withEditField(RoleBackendField);
