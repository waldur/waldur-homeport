import {
  ArrowsClockwiseIcon,
  ArrowSquareOutIcon,
  EyeIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { translate } from 'waldur-i18n-runtime';
import {
  marketplaceResourceApiKeysRotate,
  Project,
  ResourceApiKeyStatus,
} from 'waldur-js-client';
import { useManagedMutation } from 'waldur-shell';
import {
  ActionsDropdown,
  Column,
  renderFieldOrDash,
  Table,
  useRowsTable,
} from 'waldur-table';
import {
  AlertItem,
  BaseButton,
  MenuActionItem,
  SegmentedControl,
} from 'waldur-ui';

import {
  KeyStateBadge,
  keyStateNote,
  LimitMeter,
  PAGE_CLASS,
  PageHeader,
} from '../components';
import { IssueKeyDialog } from '../IssueKeyDialog';
import { portalResourceUrl } from '../links';
import { pageStatus } from '../PageStatus';
import {
  canManageKeys,
  canRotate,
  Grants,
  revealBlockedReason,
} from '../permissions';
import { useGrants } from '../queries';
import { RevealKeyDialog } from '../RevealKeyDialog';
import { sectionHref } from '../router';
import { ALL_MODELS, keyName } from '../services';
import { useInferenceData } from '../useInferenceData';

type Scope = 'mine' | 'all';

const modelsText = (key: ResourceApiKeyStatus) => {
  const models = key.effective_models ?? key.allowed_models ?? [];
  if (models.includes(ALL_MODELS)) return translate('All models');
  if (!models.length) return translate('No models');
  return models.join(', ');
};

const getColumns = (showAssignee: boolean): Column<ResourceApiKeyStatus>[] => [
  {
    title: translate('Key'),
    render: ({ row }) => (
      <div className="flex min-w-0 flex-col">
        <span className="font-medium text-primary">
          {renderFieldOrDash(keyName(row))}
        </span>
        <span className="text-xs text-tertiary">{row.offering_name}</span>
      </div>
    ),
  },
  ...(showAssignee
    ? [
        {
          title: translate('Assigned to'),
          render: ({ row }: { row: ResourceApiKeyStatus }) => (
            <>{row.user_full_name || translate('Shared')}</>
          ),
        },
      ]
    : []),
  {
    title: translate('Models'),
    render: ({ row }) => (
      <span
        className="line-clamp-2 max-w-60 !whitespace-normal text-sm"
        title={modelsText(row)}
      >
        {modelsText(row)}
      </span>
    ),
  },
  {
    title: translate('Spending limits'),
    width: '240px',
    render: ({ row }) =>
      row.spending_limit_status?.length ? (
        // Table cells have no vertical padding of their own: a stack of
        // meters needs its own, or it touches the row lines.
        <div className="flex flex-col gap-2 py-3">
          {row.spending_limit_status.map((status) => (
            <LimitMeter
              key={`${status.component_type}-${status.period}`}
              status={status}
            />
          ))}
        </div>
      ) : (
        <span className="text-sm text-tertiary">{translate('No limit')}</span>
      ),
  },
  {
    title: translate('Status'),
    width: '190px',
    render: ({ row }) => {
      const note = keyStateNote(row);
      return (
        // The note wraps under the state instead of widening the column.
        <div className="flex flex-col items-start gap-1 py-3 !whitespace-normal">
          <KeyStateBadge keyStatus={row} />
          {note ? <span className="text-xs text-tertiary">{note}</span> : null}
        </div>
      );
    },
  },
];

/** A key's menu: reveal and replace where the user may, then the portal. */
const KeyActions = ({
  row,
  project,
  grants,
  onReveal,
}: {
  row: ResourceApiKeyStatus;
  project: Project;
  grants?: Grants;
  onReveal: (key: ResourceApiKeyStatus) => void;
}) => {
  const rotate = useManagedMutation({
    mutationFn: () =>
      marketplaceResourceApiKeysRotate({ path: { uuid: row.uuid } }),
    confirmation: {
      title: translate('Replace {name}?', { name: keyName(row) ?? '' }),
      body: translate(
        'The service issues a new value and the current one stops working. Anything using it needs the new value.',
      ),
    },
    successMessage: translate('Replacement requested'),
    successDescription: translate('Reveal the key again once it is active.'),
    errorMessage: translate('Could not replace the key.'),
    closeModal: false,
  });
  const blocked = revealBlockedReason(row, grants, project);
  // The assignee's key or a shared one: offering a reveal only to be told
  // "assigned to someone else" is noise.
  const mayAskToReveal = !row.user_uuid || row.user_uuid === grants?.userUuid;
  return (
    <ActionsDropdown row={row}>
      {mayAskToReveal ? (
        <MenuActionItem
          label={translate('Reveal key')}
          iconNode={<EyeIcon weight="bold" />}
          action={() => onReveal(row)}
          disabled={!!blocked}
          tooltip={blocked}
        />
      ) : null}
      {canRotate(row, grants, project) ? (
        <MenuActionItem
          label={translate('Replace the key')}
          iconNode={<ArrowsClockwiseIcon weight="bold" />}
          action={() => rotate.mutate(undefined)}
        />
      ) : null}
      <MenuActionItem
        label={translate('Open the service in the full portal')}
        iconNode={<ArrowSquareOutIcon weight="bold" />}
        action={() => window.open(portalResourceUrl(row.resource_uuid))}
      />
    </ActionsDropdown>
  );
};

export const KeysPage = ({ project }: { project: Project }) => {
  const data = useInferenceData(project);
  const grants = useGrants();
  const [scope, setScope] = useState<Scope>('mine');
  const [issuing, setIssuing] = useState(false);
  const [revealing, setRevealing] = useState<ResourceApiKeyStatus | null>(null);
  const mayIssue = canManageKeys(grants.data, project);
  const pausedMine = data.myKeys.filter(
    (key) => key.state === 'Paused' && key.paused_by_limit,
  );
  const status = pageStatus({
    ...data,
    addHref: sectionHref(project.uuid, 'add'),
  });
  const rows = scope === 'mine' ? data.myKeys : data.keys;
  const tableProps = useRowsTable(
    `ai-inference-keys-${project.uuid}`,
    rows,
    `${scope}-${rows.map((key) => `${key.uuid}:${key.state}:${key.modified}`).join()}`,
  );
  const columns = useMemo(() => getColumns(scope === 'all'), [scope]);
  const rowActions = useMemo(
    () =>
      ({ row }: { row: ResourceApiKeyStatus }) => (
        <KeyActions
          row={row}
          project={project}
          grants={grants.data}
          onReveal={setRevealing}
        />
      ),
    [project, grants.data],
  );
  // Only active services take a key.
  const activeServices = data.services.filter(
    (service) => service.resource.state === 'OK',
  );

  return (
    <div className={PAGE_CLASS}>
      <PageHeader
        project={project}
        title={translate('API keys')}
        description={
          mayIssue
            ? translate(
                'Each key has its own models and spending limits; reaching a limit pauses that key alone.',
              )
            : translate(
                'Each key has its own models and spending limits; reaching a limit pauses that key alone. A project manager issues keys and sets both.',
              )
        }
        actions={
          mayIssue && activeServices.length ? (
            <BaseButton
              variant="primary"
              iconNode={<PlusIcon weight="bold" />}
              label={translate('Issue a key')}
              onClick={() => setIssuing(true)}
            />
          ) : null
        }
      />
      <IssueKeyDialog
        open={issuing}
        project={project}
        services={activeServices}
        onClose={() => setIssuing(false)}
      />
      <RevealKeyDialog
        apiKey={revealing}
        endpoint={
          data.services.find(
            (service) => service.resource.uuid === revealing?.resource_uuid,
          )?.endpoint
        }
        onClose={() => setRevealing(null)}
      />
      {status ?? (
        <section className="flex flex-col gap-4">
          {/* A paused key is the one thing here that needs doing something
              about: say which, until when, and who can raise its limit. */}
          {pausedMine.length ? (
            <AlertItem
              variant="warning"
              title={
                pausedMine.length === 1
                  ? translate('{name} is paused: it reached a spending limit', {
                      name: keyName(pausedMine[0]) ?? '',
                    })
                  : translate('{count} of your keys are paused at a limit', {
                      count: pausedMine.length,
                    })
              }
              body={translate(
                'A paused key resumes by itself when its limit resets. A project manager can raise the limit if it cannot wait.',
              )}
            />
          ) : null}
          <SegmentedControl
            value={scope}
            onValueChange={(value: string) => setScope(value as Scope)}
            options={[
              {
                value: 'mine',
                label: `${translate('Mine')} ${data.myKeys.length}`,
              },
              {
                value: 'all',
                label: `${translate('Everyone’s')} ${data.keys.length}`,
              },
            ]}
          />
          <Table
            {...tableProps}
            toggleColumnPin={undefined}
            columns={columns}
            rowActions={rowActions}
            // The table writes "No {verboseName} found" and lowercases it.
            verboseName={translate('keys')}
            // An empty list here is not a failed search: nothing to retry.
            placeholderHasRetry={false}
            fullWidth
            hideTitle
            hasActionBar={false}
            minHeight="auto"
            emptyMessage={
              scope === 'mine'
                ? translate(
                    'You have no key in this project. A project manager can issue you one.',
                  )
                : translate('No keys in this project yet.')
            }
          />
        </section>
      )}
    </div>
  );
};
