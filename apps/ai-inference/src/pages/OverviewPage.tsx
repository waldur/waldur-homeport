import { PlusIcon } from '@phosphor-icons/react';
import { translate } from 'waldur-i18n-runtime';
import { Project, Resource } from 'waldur-js-client';
import {
  Badge,
  BaseButton,
  Card,
  CardContent,
  CopyButton,
  StatCardGrid,
} from 'waldur-ui';

import {
  Chip,
  LimitMeter,
  PAGE_CLASS,
  PageHeader,
  ServiceMark,
} from '../components';
import { useFormatMoney } from '../format';
import { pageStatus } from '../PageStatus';
import { approverRolesText } from '../permissions';
import { useGrants } from '../queries';
import { RequestActions } from '../RequestActions';
import { navigate, sectionHref } from '../router';
import { headlineLimit, totalCost } from '../services';
import { InferenceService, useInferenceData } from '../useInferenceData';

const DASH = '—';

/** Where a requested service stands, from its order. */
const settingUpText = (resource: Resource, approvers?: string) => {
  const state = resource.order_in_progress?.state;
  if (state === 'pending-consumer') {
    return [
      translate('Waiting for approval'),
      approvers
        ? translate(
            '{approvers} approve it, here or in the portal; then the provider sets it up.',
            { approvers },
          )
        : translate(
            'Someone whose role may approve orders approves it; then the provider sets it up.',
          ),
    ] as const;
  }
  if (state === 'pending-provider') {
    return [
      translate('Waiting for the provider'),
      translate('{provider} accepts the request, then sets the service up.', {
        provider: resource.provider_name,
      }),
    ] as const;
  }
  return [
    translate('Being set up'),
    translate('Keys can be issued once it is active.'),
  ] as const;
};

/** The service's own state; a key's pause shows on the key, not here. */
const ServiceStateBadge = ({ resource }: { resource: Resource }) => {
  const [variant, label] =
    resource.state === 'Creating'
      ? (['info', settingUpText(resource)[0]] as const)
      : resource.paused
        ? (['warning', translate('Paused')] as const)
        : resource.state === 'Erred'
          ? (['danger', translate('Needs attention')] as const)
          : resource.state === 'Updating'
            ? (['info', translate('Changing')] as const)
            : (['success', translate('Active')] as const);
  return (
    <Badge
      variant={variant}
      shape="pill"
      hasBullet
      className="shrink-0 whitespace-nowrap"
    >
      {label}
    </Badge>
  );
};

const ServiceCard = ({
  service,
  project,
  userUuid,
  username,
  approvers,
}: {
  service: InferenceService;
  project: Project;
  userUuid?: string;
  username?: string;
  /** Who approves requests here, for the waiting card. */
  approvers?: string;
}) => {
  const { resource, endpoint, models } = service;
  const myKey = service.keys.find((key) => key.user_uuid === userUuid);
  const limit = headlineLimit(myKey?.spending_limit_status);
  return (
    // One block, as the design draws it: no divider under the name.
    <Card>
      <CardContent className="flex h-full flex-col gap-4">
        {/* The state sits beside the name, as the design draws it; a long
            name is cut short rather than pushing it down. A long state
            ("Waiting for approval") goes under the name instead of
            squeezing it to a few letters. */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex min-w-0 flex-1 basis-44 items-center gap-3">
            <ServiceMark name={resource.offering_name} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-primary">
                {resource.offering_name}
              </span>
              <span className="truncate text-xs text-tertiary">
                {resource.provider_name}
              </span>
            </div>
          </div>
          <ServiceStateBadge resource={resource} />
        </div>
        {resource.state === 'Creating' ? (
          <>
            <p className="text-sm text-secondary">
              {settingUpText(resource, approvers)[1]}
            </p>
            <RequestActions resource={resource} username={username} />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-tertiary">
                {translate('Endpoint · OpenAI-compatible')}
              </span>
              {endpoint ? (
                <div className="flex items-center gap-1.5 rounded-lg border border-secondary bg-secondary py-1 ps-2.5 pe-1">
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-primary">
                    {endpoint}
                  </span>
                  <CopyButton
                    value={endpoint}
                    name={translate('Endpoint')}
                    label={translate('Copy endpoint')}
                    copiedLabel={translate('Copied')}
                    iconOnly
                  />
                </div>
              ) : (
                <span className="text-sm text-tertiary">
                  {translate('The service has not reported its endpoint yet.')}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Chip>
                {models
                  ? translate('{count} models', { count: models.length })
                  : translate('Models listed at the endpoint')}
              </Chip>
              {service.keys.length ? (
                <Chip>
                  {translate('{count} keys in the project', {
                    count: service.keys.length,
                  })}
                </Chip>
              ) : null}
            </div>
            {myKey ? (
              limit ? (
                <LimitMeter status={limit} prefix={translate('Your key')} />
              ) : (
                <span className="text-sm text-secondary">
                  {translate('Your key has no spending limit of its own.')}
                </span>
              )
            ) : (
              <span className="text-sm text-tertiary">
                {translate(
                  'You have no key here yet. A project manager can issue you one.',
                )}
              </span>
            )}
            <div className="mt-auto flex gap-2">
              <BaseButton
                variant="tertiary"
                className="flex-1"
                label={translate('Keys')}
                onClick={() => navigate(sectionHref(project.uuid, 'keys'))}
              />
              <BaseButton
                variant="tertiary"
                className="flex-1"
                label={translate('Models')}
                onClick={() => navigate(sectionHref(project.uuid, 'models'))}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const OverviewPage = ({ project }: { project: Project }) => {
  const data = useInferenceData(project);
  const grants = useGrants();
  const formatMoney = useFormatMoney();
  const status = pageStatus({
    ...data,
    addHref: sectionHref(project.uuid, 'add'),
  });
  const paused = data.myKeys.filter((key) => key.state === 'Paused').length;
  const knownModels = data.services.reduce(
    (sum, service) => sum + (service.models?.length ?? 0),
    0,
  );

  return (
    <div className={PAGE_CLASS}>
      <PageHeader
        project={project}
        title={project.name}
        description={translate(
          'The inference services of this project, and your keys for them.',
        )}
        actions={
          <BaseButton
            variant="tertiary"
            iconNode={<PlusIcon weight="bold" />}
            label={translate('Add a service')}
            onClick={() => navigate(sectionHref(project.uuid, 'add'))}
          />
        }
      />
      {status ?? (
        <>
          <StatCardGrid
            spaceless
            stats={[
              {
                label: translate('Your spend this month'),
                value: formatMoney(totalCost(data.myKeys)) ?? DASH,
                footer: translate('Estimate, across your keys'),
                link: {
                  to: sectionHref(project.uuid, 'usage'),
                  label: translate('Usage & limits'),
                },
              },
              {
                label: translate('Your keys'),
                value: data.myKeys.length,
                footer: paused
                  ? translate('{count} paused', { count: paused })
                  : undefined,
                tone: paused ? 'warning' : undefined,
                link: {
                  to: sectionHref(project.uuid, 'keys'),
                  label: translate('API keys'),
                },
              },
              {
                label: translate('Models'),
                value: knownModels || DASH,
                footer:
                  data.services.length === 1
                    ? translate('1 service')
                    : translate('{count} services', {
                        count: data.services.length,
                      }),
                link: {
                  to: sectionHref(project.uuid, 'models'),
                  label: translate('Models'),
                },
              },
            ]}
          />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {data.services.map((service) => (
              <ServiceCard
                key={service.resource.uuid}
                service={service}
                project={project}
                userUuid={data.me?.uuid}
                username={data.me?.username}
                approvers={approverRolesText(grants.data)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
