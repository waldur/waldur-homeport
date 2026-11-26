import { EyeIcon, KeyIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  Offering,
  OptionField,
  Resource,
  ResourceOptionSecretStatus,
  User,
} from 'waldur-js-client';

import {
  BaseButton,
  PropertyCard,
  PropertyItem,
  PropertyList,
} from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import {
  formatSecretStatus,
  resolveSecretPolicy,
  SecretPolicy,
} from '@/marketplace/common/secretOptions';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { propVal } from '@/property/propertyFields';
import { useUser } from '@/workspace/hooks';

import { canUpdateResourceOptions } from './permissions';

const SetOptionSecretDialog = lazyComponent(() =>
  import('./SetOptionSecretDialog').then((module) => ({
    default: module.SetOptionSecretDialog,
  })),
);

const RevealOptionSecretDialog = lazyComponent(() =>
  import('./RevealOptionSecretDialog').then((module) => ({
    default: module.RevealOptionSecretDialog,
  })),
);

// Where the server accepts a new value; elsewhere it answers 409.
const SETTABLE_STATES: Resource['state'][] = [
  'Creating',
  'OK',
  'Updating',
  'Erred',
];

export type SecretsResource = Pick<
  Resource,
  | 'uuid'
  | 'name'
  | 'state'
  | 'option_secrets'
  | 'project_uuid'
  | 'customer_uuid'
  | 'provider_uuid'
  | 'offering_uuid'
  | 'offering_plugin_options'
>;

type SecretsOffering = Pick<Offering, 'options' | 'resource_options'>;

/**
 * A secret option of the offering by name. One defined both for orders and
 * for resources takes its resource definition, as on the server.
 */
const getSecretOption = (
  offering: SecretsOffering,
  name: string,
): OptionField | undefined =>
  [offering?.resource_options, offering?.options]
    .map((set) => set?.options?.[name])
    .find((option) => option?.type === 'secret');

/** May the user manage secrets from the provider's side? */
export const isOptionSecretsProvider = (
  user: Pick<User, 'is_staff' | 'permissions'>,
  resource: Pick<SecretsResource, 'provider_uuid' | 'offering_uuid'>,
) =>
  hasPermission(user, {
    permission: PermissionEnum.UPDATE_RESOURCE_OPTIONS,
    customerId: resource.provider_uuid,
    offeringId: resource.offering_uuid,
  });

/** "Set · changed …" with who set it, or "Not set"; never the value. */
export const formatSecretStatusValue = (
  status: ResourceOptionSecretStatus | undefined,
  policy: SecretPolicy | undefined,
  providerView: boolean,
) => {
  if (!status?.is_set) {
    return propVal.text(
      !resolveSecretPolicy(policy).customerSets && !providerView
        ? translate('Not set: the provider sets it after provisioning')
        : formatSecretStatus(status),
    );
  }
  return propVal.annotated(formatSecretStatus(status), {
    subtext: status.modified
      ? translate('Changed {date}', { date: formatDateTime(status.modified) })
      : undefined,
    hint:
      status.source === 'provider'
        ? translate('by the provider')
        : status.source === 'customer'
          ? translate('by the customer')
          : undefined,
  });
};

/**
 * What the user may do with one secret. A customer replaces a secret they
 * enter, and reveals one when the policy lets customers read it back; the
 * provider, in its own view, sets and reveals any of them.
 */
export const SecretActions: FC<{
  resource: SecretsResource;
  name: string;
  label: string;
  policy: SecretPolicy | undefined;
  refetch?: () => void;
  providerView?: boolean;
}> = ({ resource, name, label, policy, refetch, providerView = false }) => {
  const user = useUser();
  const { openDialog } = useModal();
  const resolved = resolveSecretPolicy(policy);
  const status = resource.option_secrets?.[name];
  const asProvider = providerView && isOptionSecretsProvider(user, resource);
  const canSet = providerView
    ? asProvider
    : resolved.customerSets && canUpdateResourceOptions(user, resource);
  const canReveal =
    Boolean(status?.is_set) &&
    (providerView
      ? asProvider
      : resolved.customerCanReveal &&
        hasPermission(user, {
          permission: PermissionEnum.REVEAL_RESOURCE_API_KEY,
          projectId: resource.project_uuid,
          customerId: resource.customer_uuid,
        }));
  if (!canSet && !canReveal) {
    return null;
  }
  const settable = SETTABLE_STATES.includes(resource.state);
  const open = (dialog) =>
    openDialog(dialog, {
      resolve: {
        resource,
        optionName: name,
        optionLabel: label,
        policy,
        asProvider,
        refetch,
      },
    });
  return (
    <div className="flex flex-wrap gap-2">
      {canSet && (
        <BaseButton
          size="sm"
          variant="tertiary"
          iconNode={<KeyIcon weight="bold" />}
          iconRight
          label={status?.is_set ? translate('Replace') : translate('Set')}
          aria-label={translate('Set the secret {option}', { option: label })}
          disabled={!settable}
          disabledReason={
            settable
              ? undefined
              : translate(
                  'The secret cannot be changed while the resource is {state}.',
                  { state: resource.state },
                )
          }
          onClick={() => open(SetOptionSecretDialog)}
        />
      )}
      {canReveal && (
        <BaseButton
          size="sm"
          variant="tertiary"
          iconNode={<EyeIcon weight="bold" />}
          iconRight
          label={translate('Reveal')}
          aria-label={translate('Reveal the secret {option}', {
            option: label,
          })}
          onClick={() => open(RevealOptionSecretDialog)}
        />
      )}
    </div>
  );
};

/**
 * The secret options of the resource's offering: whether each is set, and
 * what the user may do about it. `names` limits the list, such as to the
 * secrets the options card does not already show.
 */
export const OptionSecretsCard: FC<{
  resource: SecretsResource;
  offering: SecretsOffering;
  refetch?: () => void;
  providerView?: boolean;
  names?: string[];
}> = ({ resource, offering, refetch, providerView = false, names }) => {
  const entries = Object.entries(resource.option_secrets || {}).filter(
    ([name]) => !names || names.includes(name),
  );
  if (!entries.length) {
    return null;
  }
  return (
    <div data-testid="option-secrets-card">
      <PropertyCard bordered title={translate('Secrets')} refetch={refetch}>
        <PropertyList>
          {entries.map(([name, status]) => {
            const option = getSecretOption(offering, name);
            const label = option?.label || name;
            const policy = option?.default_configs as SecretPolicy;
            return (
              <PropertyItem
                key={name}
                label={label}
                description={option?.help_text}
                value={formatSecretStatusValue(status, policy, providerView)}
                actions={
                  <SecretActions
                    resource={resource}
                    name={name}
                    label={label}
                    policy={policy}
                    refetch={refetch}
                    providerView={providerView}
                  />
                }
              />
            );
          })}
        </PropertyList>
      </PropertyCard>
    </div>
  );
};

/** The provider view's tab: every secret, through the provider endpoints. */
export const ProviderOptionSecretsTab: FC<{
  resource: Resource;
  offering: Offering;
  refetch?: () => void;
}> = (props) => <OptionSecretsCard {...props} providerView />;
