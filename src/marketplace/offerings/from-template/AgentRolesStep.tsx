import { FC, useEffect, useMemo } from 'react';
import { useForm, useFormState } from 'react-final-form';
import { AgentPlugin } from 'waldur-js-client';

import { WizardModal, WizardStepProps } from 'waldur-wizard';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import {
  BooleanGroup,
  CommaSeparatedListGroup,
  NumberGroup,
  SelectGroup,
  StringGroup,
} from '@/form';
import { translate } from '@/i18n';
import {
  AGENT_ROLE_FIELDS,
  AgentRoleField,
  getRoleDescriptions,
  getRoleLabels,
} from '@/marketplace/offerings/update/integration/agentConfiguration';

import {
  AskedBackend,
  AskedSetting,
  checkBackendSetting,
  getBackendSettingValues,
  useAskedBackendSettings,
  useSiteAgentPlugins,
} from './backendSettings';
import { parseNumber } from './ParametersStep';
import { CreateFromTemplateFormData } from './types';
import { getTemplateCustomBackends, getTemplateRoles } from './utils';

interface RoleOption {
  value: string;
  label: string;
}

/**
 * The backends that can fill each role: the catalogue's plugins for it, the
 * custom backends listed, and the template's own choice even if neither
 * lists it. "Off" names no backend.
 */
const getRoleOptions = (
  plugins: AgentPlugin[],
  custom: string[],
  templateRoles: Record<AgentRoleField, string>,
): Record<AgentRoleField, RoleOption[]> =>
  Object.fromEntries(
    AGENT_ROLE_FIELDS.map(({ field, role }) => {
      const options: RoleOption[] = [{ value: '', label: translate('Off') }];
      plugins
        .filter((plugin) => plugin.roles.includes(role))
        .forEach((plugin) =>
          options.push({ value: plugin.name, label: plugin.name }),
        );
      custom.forEach((name) => {
        if (!options.some((option) => option.value === name)) {
          options.push({
            value: name,
            label: translate('{backend} (custom)', { backend: name }),
          });
        }
      });
      const fromTemplate = templateRoles[field];
      if (
        fromTemplate &&
        !options.some((option) => option.value === fromTemplate)
      ) {
        options.push({ value: fromTemplate, label: fromTemplate });
      }
      return [field, options];
    }),
  ) as Record<AgentRoleField, RoleOption[]>;

const BackendSettingField: FC<{ setting: AskedSetting }> = ({ setting }) => {
  const common = {
    name: `backend_settings.${setting.key}`,
    label: setting.title,
    description: setting.description,
    required: true,
    validate: (value: unknown) => checkBackendSetting(setting, value),
    'data-testid': `backend-setting-${setting.key}`,
  };
  if (setting.choices?.length) {
    return (
      <SelectGroup
        {...common}
        options={setting.choices.map((choice) => ({
          value: choice,
          label: String(choice),
        }))}
        simpleValue
        isClearable={false}
      />
    );
  }
  switch (setting.kind) {
    case 'boolean':
      return <BooleanGroup {...common} />;
    case 'integer':
    case 'number':
      return (
        <NumberGroup
          {...common}
          parse={parseNumber}
          step={setting.kind === 'integer' ? 1 : 'any'}
        />
      );
    default:
      return <StringGroup {...common} />;
  }
};

const BackendSettingsBlock: FC<{ asked: AskedBackend[] }> = ({ asked }) => (
  <section className="mt-6" data-testid="backend-settings">
    <h3 className="text-base font-semibold mb-1">
      {translate('Settings the chosen backends need')}
    </h3>
    <p className="text-sm text-tertiary mb-4">
      {translate(
        'The template does not set these, and the backends cannot run without them.',
      )}
    </p>
    {asked.map(({ backend, settings }) => (
      <div key={backend} className="mb-4">
        <h4 className="text-sm font-semibold mb-2">{backend}</h4>
        {settings.map((setting) => (
          <BackendSettingField key={setting.key} setting={setting} />
        ))}
      </div>
    ))}
  </section>
);

export const AgentRolesStep: FC<WizardStepProps> = (props) => {
  const form = useForm<CreateFromTemplateFormData>();
  const { values } = useFormState<CreateFromTemplateFormData>();
  const { data, isLoading, error, refetch } = useSiteAgentPlugins();
  const asked = useAskedBackendSettings(
    data,
    values.agent_roles,
    values.template,
  );
  // The values follow the settings asked for: a new one opens on its
  // default, one still asked keeps what was entered, the rest are dropped.
  useEffect(() => {
    if (!data) {
      return;
    }
    const current = form.getState().values.backend_settings ?? {};
    const next = getBackendSettingValues(asked, current);
    if (JSON.stringify(next) !== JSON.stringify(current)) {
      form.change('backend_settings', next);
    }
  }, [form, data, asked]);
  const templateRoles = useMemo(
    () => getTemplateRoles(values.template),
    [values.template],
  );
  // The template's own custom backends, and those listed here.
  const custom = [
    ...getTemplateCustomBackends(values.template),
    ...(values.custom_backends ?? []),
  ];
  const options = useMemo(
    () => getRoleOptions(data ?? [], custom, templateRoles),
    // The list's contents, not its identity: final-form hands a new array
    // on every change of any value.

    [data, custom.join('\n'), templateRoles],
  );
  const labels = getRoleLabels();
  const descriptions = getRoleDescriptions();

  return (
    <WizardModal {...props}>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to load the site agent plugins.')}
          loadData={refetch}
        />
      ) : (
        <>
          {AGENT_ROLE_FIELDS.map(({ field }) => (
            <SelectGroup
              key={field}
              name={`agent_roles.${field}`}
              label={labels[field]}
              description={
                templateRoles[field] &&
                values.agent_roles?.[field] !== templateRoles[field]
                  ? translate('{description} The template uses {backend}.', {
                      description: descriptions[field],
                      backend: templateRoles[field],
                    })
                  : descriptions[field]
              }
              options={options[field]}
              simpleValue
              isClearable={false}
              // final-form drops a blank value to undefined; "Off" is
              // kept as the blank it is.
              parse={(value) => value ?? ''}
              data-testid={`agent-role-${field}`}
            />
          ))}
          <CommaSeparatedListGroup
            name="custom_backends"
            label={translate('Custom backends')}
            description={translate(
              'Plugins of your own, not in the site agent plugin catalog. Listed here, they can be chosen for a role above.',
            )}
            spaceless
          />
          {asked.length ? <BackendSettingsBlock asked={asked} /> : null}
        </>
      )}
    </WizardModal>
  );
};
