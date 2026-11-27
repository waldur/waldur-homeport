import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import {
  AgentConfiguration,
  AgentPlugin,
  marketplaceProviderOfferingsRetrieve,
  marketplaceProviderOfferingsSiteAgentConfigRetrieve,
  marketplaceProviderOfferingsUpdateIntegration,
  marketplaceSiteAgentPluginsList,
  SiteAgentOfferingSecret,
} from 'waldur-js-client';

import { Code, PropertyItem, PropertyList } from 'waldur-ui';

import { UI_STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { atLeast, composeValidators, lessThanOrEqual } from '@/core/validators';
import {
  CommaSeparatedListEditField,
  EditFieldProvider,
  NumberEditField,
  SelectEditField,
  StringEditField,
} from '@/form/editFields';
import { TabbedSection } from '@/form/TabbedSection';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { propVal } from '@/property/propertyFields';
import { useNotify } from '@/store/notify';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';

import {
  AGENT_ROLE_FIELDS,
  AGENT_SWITCH_DEFAULTS,
  AgentRoleField,
  changedSinceOpened,
  clearedLastRole,
  DEFAULT_ROLE_BACKENDS,
  describeRefusal,
  editedPath,
  expandRolesAndSettings,
  getRolesAndSettings,
  isAgentConfigurationVisible,
  mergeAgentConfiguration,
  replacedKeys,
  withDefaultRoles,
  ROLES_AND_SETTINGS,
  splitSecretsByBlock,
  validateRolesAndSettings,
} from './agentConfiguration';
import { JsonObjectEditField, jsonObjectValidator } from './JsonObjectField';
import {
  getMembershipSyncWarning,
  MembershipSyncEditField,
} from './MembershipSyncField';
import { StateSwitchEditField } from './StateSwitchField';
import { OfferingEditPanelProps } from './types';

// The membership sync switch has three states: unset, it follows stomp_enabled.
type MembershipSyncChoice = 'follow' | 'on' | 'off';

const toMembershipSyncChoice = (
  value: boolean | null | undefined,
): MembershipSyncChoice =>
  value === true ? 'on' : value === false ? 'off' : 'follow';

const fromMembershipSyncChoice = (value: unknown): boolean | null =>
  value === 'on' ? true : value === 'off' ? false : null;

const getMembershipSyncOptions = () => [
  { value: 'follow', label: translate('Same as STOMP events') },
  { value: 'on', label: translate('Over STOMP') },
  { value: 'off', label: translate('By polling') },
];

const getRoleLabels = (): Record<AgentRoleField, string> => ({
  order_processing_backend: translate('Order processing'),
  membership_sync_backend: translate('Membership sync'),
  reporting_backend: translate('Reporting'),
  username_management_backend: translate('Username management'),
});

const getRoleDescriptions = (): Record<AgentRoleField, string> => ({
  order_processing_backend: translate(
    'Creates, updates and terminates resources on the backend.',
  ),
  membership_sync_backend: translate(
    "Keeps the backend's users in step with resource teams.",
  ),
  reporting_backend: translate('Reports usage from the backend to Waldur.'),
  username_management_backend: translate(
    'Gives offering users their usernames on the backend.',
  ),
});

const getTrustHint = () =>
  translate(
    'Changing this needs the permission to change the agent configuration.',
  );

// Shown for a role left unset: with no role set at all the agent runs SLURM
// for the three agent roles, and base for username management. `value` is
// the stored one: the editor opens on the default, which is not stored.
const renderRole = (
  value: string | undefined,
  field: AgentRoleField,
  anyAgentRole: boolean,
) => {
  if (value) {
    return value;
  }
  if (field === 'username_management_backend' || !anyAgentRole) {
    return translate('{backend} (default)', {
      backend: DEFAULT_ROLE_BACKENDS[field],
    });
  }
  return translate('Off');
};

const getRequirementLabels = () => ({
  required: translate('Required'),
  required_with_parent: translate('Required once its block is set'),
  optional: translate('Optional'),
});

const getSecretColumns = (): Column<SiteAgentOfferingSecret>[] => [
  {
    title: translate('Setting'),
    render: ({ row }) => <Code>{row.field}</Code>,
  },
  { title: translate('Backend'), render: ({ row }) => row.backend },
  {
    title: translate('Needed'),
    render: ({ row }) =>
      getRequirementLabels()[row.requirement] ?? row.requirement,
  },
];

const AgentLoadsPanel: FC<{ offeringUuid: string }> = ({ offeringUuid }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['site-agent-config', offeringUuid],
    queryFn: () =>
      marketplaceProviderOfferingsSiteAgentConfigRetrieve({
        path: { uuid: offeringUuid },
      }).then((response) => response.data),
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error || !data) {
    return (
      <p className="text-danger">
        {translate("Unable to load the agent's configuration.")}
      </p>
    );
  }
  const { needed, ifConfigured } = splitSecretsByBlock(
    data.secrets,
    data.offering?.backend_settings,
  );
  return (
    <>
      <p className="text-secondary mb-4">
        {translate(
          'The configuration the site agent loads for this offering. Secrets are not part of it: the agent takes them from its own configuration file.',
        )}
      </p>
      <PropertyList variant="summary" className="mb-5">
        <PropertyItem
          label={translate('Version')}
          value={propVal.code(data.version, { truncate: 'middle' })}
          hasCopy
        />
        <PropertyItem
          label={translate('Backend type')}
          value={data.offering?.backend_type}
        />
      </PropertyList>
      <h3 className="text-base font-semibold mb-2">
        {translate('Secrets the agent configuration file must hold')}
      </h3>
      {needed.length ? (
        <SimpleTable columns={getSecretColumns()} rows={needed} />
      ) : (
        <p className="text-tertiary">
          {translate('The backends in use need no secrets.')}
        </p>
      )}
      {ifConfigured.length ? (
        <>
          <h3 className="text-base font-semibold mt-5 mb-2">
            {translate('Secrets needed only once their block is configured')}
          </h3>
          <p className="text-secondary mb-2">
            {translate(
              'The backends can use these settings, but this offering does not configure the block that holds them. Leave them out of the agent configuration file until it does.',
            )}
          </p>
          <SimpleTable columns={getSecretColumns()} rows={ifConfigured} />
        </>
      ) : null}
    </>
  );
};

export const AgentConfigurationSection: FC<OfferingEditPanelProps> = ({
  offering,
  refetch,
}) => {
  const { showErrorResponse } = useNotify();
  const stored = offering.agent_configuration;

  const { mutateAsync } = useManagedMutation<
    any,
    any,
    { change: Record<string, unknown>; path: string }
  >({
    // update_integration replaces the whole configuration, so the change is
    // laid over the configuration as it is now, not over the copy this page
    // read when it opened: that would undo whatever was saved since.
    mutationFn: async ({ change, path }) => {
      const { data } = await marketplaceProviderOfferingsRetrieve({
        path: { uuid: offering.uuid },
        query: { field: ['agent_configuration'] },
      });
      const current = data.agent_configuration ?? stored ?? {};
      // A whole-object editor (the JSON blocks, roles and settings together)
      // replaces what it was opened on; merging it over a newer value would
      // undo a change the user never saw. A single field is merged as is.
      if (
        changedSinceOpened(stored ?? {}, current, replacedKeys(path)).length
      ) {
        refetch?.();
        throw {
          fieldError: [
            translate(
              'This changed since you opened it. Close and reopen to edit the current value.',
            ),
          ],
        };
      }
      const next = withDefaultRoles(
        current,
        mergeAgentConfiguration(current, change),
        change,
      );
      const refusal = clearedLastRole(current, next, path);
      if (refusal) {
        throw { fieldError: [refusal] };
      }
      return marketplaceProviderOfferingsUpdateIntegration({
        path: { uuid: offering.uuid },
        body: { agent_configuration: next },
      });
    },
    successMessage: translate('Agent configuration has been updated.'),
    refetch,
    invalidateQueries: [{ queryKey: ['site-agent-config', offering.uuid] }],
  });

  const update = useCallback(
    (formData: { agent_configuration?: Record<string, any> }) => {
      let change = { ...formData.agent_configuration };
      let path = editedPath(change);
      if (ROLES_AND_SETTINGS in change) {
        change = expandRolesAndSettings(change[ROLES_AND_SETTINGS]);
        path = ROLES_AND_SETTINGS;
      }
      const events = change.event_settings;
      if (events && 'stomp_membership_sync_enabled' in events) {
        change.event_settings = {
          ...events,
          stomp_membership_sync_enabled: fromMembershipSyncChoice(
            events.stomp_membership_sync_enabled,
          ),
        };
      }
      // A refusal the dialog can show under the field is shown there and not
      // as a notification too; anything else, such as a server error, is a
      // notification.
      return mutateAsync({ change, path }).catch((error) => {
        if (error?.fieldError) {
          throw error;
        }
        const refusal = describeRefusal(error, path);
        if (refusal?.errors.length) {
          throw { fieldError: refusal.errors, fieldHint: refusal.hints };
        }
        showErrorResponse(
          error,
          translate('Unable to update the agent configuration.'),
        );
        throw error;
      });
    },
    [mutateAsync, showErrorResponse],
  );

  // What the rows show and the edit dialogs start from: a switch left unset
  // reads as the agent's default, the membership sync switch as a choice.
  const scope = useMemo(() => {
    const configuration: AgentConfiguration = stored ?? {};
    // A role's editor opens on the backend it shows: with no agent role set
    // that is the default for each, and base for username management.
    const noAgentRole = !AGENT_ROLE_FIELDS.some(
      ({ field }) =>
        field !== 'username_management_backend' &&
        Boolean(configuration[field]),
    );
    const roles = Object.fromEntries(
      AGENT_ROLE_FIELDS.filter(
        ({ field }) =>
          !configuration[field] &&
          (noAgentRole || field === 'username_management_backend'),
      ).map(({ field }) => [field, DEFAULT_ROLE_BACKENDS[field]]),
    );
    return {
      agent_configuration: {
        ...configuration,
        ...roles,
        // The JSON editors open on an empty object, not a blank page.
        backend_settings: configuration.backend_settings ?? {},
        [ROLES_AND_SETTINGS]: getRolesAndSettings(configuration),
        backend_components: configuration.backend_components ?? {},
        event_settings: {
          ...AGENT_SWITCH_DEFAULTS.event_settings,
          ...configuration.event_settings,
          stomp_membership_sync_enabled: toMembershipSyncChoice(
            configuration.event_settings?.stomp_membership_sync_enabled,
          ),
        },
        agent_settings: {
          ...AGENT_SWITCH_DEFAULTS.agent_settings,
          ...configuration.agent_settings,
        },
      },
    };
  }, [stored]);

  const { data: plugins } = useQuery({
    queryKey: ['site-agent-plugins'],
    queryFn: () =>
      marketplaceSiteAgentPluginsList().then((response) => response.data),
    refetchOnWindowFocus: false,
    staleTime: UI_STALE_TIME,
  });

  const roleOptions = useMemo(() => {
    const custom = stored?.custom_backends ?? [];
    return Object.fromEntries(
      AGENT_ROLE_FIELDS.map(({ field, role }) => {
        const options = (plugins ?? [])
          .filter((plugin: AgentPlugin) => plugin.roles.includes(role))
          .map((plugin) => ({ value: plugin.name, label: plugin.name }));
        custom.forEach((name) =>
          options.push({
            value: name,
            label: translate('{backend} (custom)', { backend: name }),
          }),
        );
        // A stored backend the catalogue no longer lists stays selectable.
        const current = stored?.[field];
        if (current && !options.some((option) => option.value === current)) {
          options.push({ value: current, label: current });
        }
        return [field, options];
      }),
    ) as Record<AgentRoleField, { value: string; label: string }[]>;
  }, [plugins, stored]);

  if (!isAgentConfigurationVisible(offering)) {
    return null;
  }

  const roleLabels = getRoleLabels();
  const roleDescriptions = getRoleDescriptions();
  const anyAgentRole = AGENT_ROLE_FIELDS.some(
    ({ field }) =>
      field !== 'username_management_backend' && Boolean(stored?.[field]),
  );
  const trustHint = getTrustHint();
  const stompEnabled = Boolean(stored?.event_settings?.stomp_enabled);
  // The agent skips membership sync altogether when it is set to STOMP while
  // STOMP events are off (waldur_site_agent/common/structures.py).
  const membershipSyncWarning =
    stored?.event_settings?.stomp_membership_sync_enabled === true &&
    !stompEnabled
      ? getMembershipSyncWarning()
      : undefined;

  return (
    <EditFieldProvider scope={scope} callback={update}>
      <TabbedSection title={translate('Agent configuration')}>
        <TabbedSection.Tab id="agent-backends" title={translate('Backends')}>
          {AGENT_ROLE_FIELDS.map(({ field }) => (
            <SelectEditField
              key={field}
              name={`agent_configuration.${field}`}
              label={roleLabels[field]}
              description={roleDescriptions[field]}
              labelTooltip={trustHint}
              options={roleOptions[field]}
              simpleValue
              isClearable
              renderValue={() =>
                renderRole(stored?.[field], field, anyAgentRole)
              }
            />
          ))}
          <CommaSeparatedListEditField
            name="agent_configuration.custom_backends"
            label={translate('Custom backends')}
            description={translate(
              "Your site's own plugins, not in the catalog.",
            )}
            dialogDescription={translate(
              "Your site's own plugins, not in the plugin catalog. Their settings are not checked.",
            )}
            labelTooltip={trustHint}
          />
          <JsonObjectEditField
            name={`agent_configuration.${ROLES_AND_SETTINGS}`}
            label={translate('Edit roles and backend settings together')}
            description={translate(
              'Switch to backends whose settings the current ones refuse.',
            )}
            dialogDescription={translate(
              'The four role backends and backend_settings, saved in one request. Use it to switch to a backend whose settings the current one refuses, or that requires settings the current one does not know. A role left blank is cleared. Secrets stay in the agent configuration file.',
            )}
            labelTooltip={trustHint}
            dialogSize="xl"
            validate={composeValidators(
              jsonObjectValidator,
              validateRolesAndSettings,
            )}
            renderValue={() => translate('Edit as JSON')}
          />
        </TabbedSection.Tab>

        <TabbedSection.Tab id="agent-events" title={translate('Events')}>
          <StateSwitchEditField
            name="agent_configuration.event_settings.stomp_enabled"
            label={translate('Receive events over STOMP')}
            description={translate(
              'React to changes at once, instead of polling.',
            )}
            dialogDescription={translate(
              'The agent reacts to orders and changes as they happen, instead of polling Waldur.',
            )}
            labelTooltip={trustHint}
          />
          <MembershipSyncEditField
            name="agent_configuration.event_settings.stomp_membership_sync_enabled"
            label={translate('Membership sync')}
            description={translate('How the agent learns of team changes.')}
            labelTooltip={trustHint}
            options={getMembershipSyncOptions()}
            simpleValue
            stompEnabled={stompEnabled}
            warnTooltip={membershipSyncWarning}
          />
          <StringEditField
            name="agent_configuration.event_settings.stomp_ws_host"
            label={translate('STOMP WebSocket host')}
            description={translate('The broker as the agent reaches it.')}
            dialogDescription={translate(
              'The message broker as the agent reaches it, which may differ from the address Waldur uses.',
            )}
            labelTooltip={trustHint}
          />
          <NumberEditField
            name="agent_configuration.event_settings.stomp_ws_port"
            label={translate('STOMP WebSocket port')}
            labelTooltip={trustHint}
            validate={composeValidators(atLeast(1), lessThanOrEqual(65535))}
          />
          <StringEditField
            name="agent_configuration.event_settings.stomp_ws_path"
            label={translate('STOMP WebSocket path')}
            labelTooltip={trustHint}
          />
          <StateSwitchEditField
            name="agent_configuration.event_settings.websocket_use_tls"
            label={translate('Use TLS')}
            description={translate('Connect to the broker over TLS.')}
            labelTooltip={trustHint}
          />
        </TabbedSection.Tab>

        <TabbedSection.Tab id="agent-settings" title={translate('Agent')}>
          <StateSwitchEditField
            name="agent_configuration.agent_settings.resource_import_enabled"
            label={translate('Import backend resources')}
            description={translate(
              'Import resources found on the backend into Waldur.',
            )}
            labelTooltip={trustHint}
          />
          <StateSwitchEditField
            name="agent_configuration.agent_settings.username_reconciliation_enabled"
            label={translate('Reconcile usernames')}
            description={translate(
              'Periodically take usernames from the backend.',
            )}
            labelTooltip={trustHint}
          />
          <StateSwitchEditField
            name="agent_configuration.agent_settings.preserve_unmanaged_backend_users"
            label={translate('Keep unmanaged backend users')}
            description={translate(
              'Membership sync keeps backend users Waldur never knew.',
            )}
            dialogDescription={translate(
              'Membership sync keeps backend users Waldur has never known as offering users, instead of removing everyone not on the resource team. Users Waldur has known are still removed once they leave the team.',
            )}
            labelTooltip={trustHint}
          />
          <StateSwitchEditField
            name="agent_configuration.agent_settings.omit_anomalous_usage_components"
            label={translate('Skip decreasing usage')}
            description={translate(
              'Report the rest when a component goes down.',
            )}
            dialogDescription={translate(
              'When the usage of a component goes down, report the usage of the other components without it, instead of holding back the whole report. Suits backends whose meters are independent, such as another Waldur.',
            )}
          />
        </TabbedSection.Tab>

        <TabbedSection.Tab
          id="agent-backend-settings"
          title={translate('Backend settings')}
        >
          <JsonObjectEditField
            name="agent_configuration.backend_settings"
            label={translate('Backend settings')}
            description={translate(
              'Settings of the backends, as JSON. No secrets.',
            )}
            dialogDescription={translate(
              'Settings of the backends above, as a JSON object. Secrets stay in the agent configuration file on the agent host; Waldur refuses them. Settings the plugin catalog marks sensitive, and any the backends do not declare, need the permission to change the agent configuration.',
            )}
            dialogSize="xl"
            validate={jsonObjectValidator}
          />
          <JsonObjectEditField
            name="agent_configuration.backend_components"
            label={translate('Backend components')}
            description={translate('Agent-only fields per component, as JSON.')}
            dialogDescription={translate(
              "Per component type, only what the agent reads beyond the offering's own components, such as unit_factor_reporting. Unit, unit factor and limits are set on the offering's components (Accounting → Components).",
            )}
            dialogSize="xl"
            validate={jsonObjectValidator}
          />
        </TabbedSection.Tab>

        <TabbedSection.Tab
          id="agent-loads"
          title={translate('What the agent loads')}
          plain
        >
          <AgentLoadsPanel offeringUuid={offering.uuid} />
        </TabbedSection.Tab>
      </TabbedSection>
    </EditFieldProvider>
  );
};
