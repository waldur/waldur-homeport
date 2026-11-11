import { useQuery } from '@tanstack/react-query';
import { FC, ReactNode } from 'react';
import {
  DemoPresetPreview as Preview,
  DemoPresetPreviewFeatureChange,
  DemoPresetPreviewOfferingGroup,
  DemoPresetPreviewOrganization,
  DemoPresetPreviewSettingChange,
  DemoPresetPreviewUser,
  marketplaceDemoPresetsInfoRetrieve,
} from 'waldur-js-client';

import {
  AlertItem,
  Badge,
  Code,
  EmptyState,
  PropertyItem,
  PropertyList,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';

import { LoadDemoPresetButton } from './LoadDemoPresetButton';

const demoPresetPreviewQueryKey = (name: string) => [
  'demo-preset-preview',
  name,
];

const Section: FC<{
  title: ReactNode;
  children: ReactNode;
  className?: string;
}> = ({ title, children, className }) => (
  <section className={className ?? 'mb-6'}>
    <h3 className="mb-2 text-sm font-semibold text-primary">{title}</h3>
    {children}
  </section>
);

const OverlayTitle: FC<{ overlay: string }> = ({ overlay }) => (
  <>{translate('From the deployment’s overlay {name}', { name: overlay })}</>
);

const userColumns = (withPasswords: boolean): Column<DemoPresetPreviewUser>[] =>
  [
    {
      title: translate('Username'),
      render: ({ row }) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-medium">{row.username}</span>
          {row.is_staff && (
            <Badge variant="danger" shape="pill" tone="outline">
              {translate('Staff')}
            </Badge>
          )}
          {row.is_support && (
            <Badge variant="warning" shape="pill" tone="outline">
              {translate('Support')}
            </Badge>
          )}
          {!row.is_active && (
            <Badge variant="neutral" shape="pill" tone="outline">
              {translate('Inactive')}
            </Badge>
          )}
        </div>
      ),
    },
    {
      title: translate('Name'),
      render: ({ row }) => <>{row.full_name || row.email}</>,
    },
    {
      title: translate('Roles'),
      render: ({ row }) =>
        row.roles.length ? (
          <ul className="m-0 list-none p-0">
            {row.roles.map((role, index) => (
              <li key={index}>
                {role.role}
                {role.scope_name ? ` · ${role.scope_name}` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-quaternary">—</span>
        ),
    },
    withPasswords && {
      title: translate('Password'),
      render: ({ row }) =>
        row.password ? (
          <Code>{row.password}</Code>
        ) : (
          <span className="text-quaternary">
            {row.is_staff || row.is_support
              ? translate('Not shown')
              : translate('None')}
          </span>
        ),
    },
  ].filter(Boolean) as Column<DemoPresetPreviewUser>[];

const UsersTable: FC<{
  users: DemoPresetPreviewUser[];
  withPasswords?: boolean;
}> = ({ users, withPasswords = true }) =>
  users.length ? (
    <SimpleTable<DemoPresetPreviewUser>
      columns={userColumns(withPasswords)}
      rows={users}
      rowKey="username"
    />
  ) : (
    <EmptyState size="sm" message={translate('No users.')} />
  );

const Organizations: FC<{ organizations: DemoPresetPreviewOrganization[] }> = ({
  organizations,
}) =>
  organizations.length ? (
    <ul className="m-0 list-none space-y-3 p-0">
      {organizations.map((organization) => (
        <li key={organization.name}>
          <div className="font-medium text-primary">{organization.name}</div>
          {organization.projects.length ? (
            <ul className="mt-1 ml-4 list-disc space-y-1 text-secondary">
              {organization.projects.map((project) => (
                <li key={project.name}>
                  {project.name}
                  {project.resources.length > 0 && (
                    <span className="text-quaternary">
                      {' — '}
                      {project.resources.join(', ')}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="ml-4 text-quaternary">
              {translate('No projects.')}
            </div>
          )}
        </li>
      ))}
    </ul>
  ) : (
    <EmptyState size="sm" message={translate('No organizations.')} />
  );

const offeringColumns: Column<DemoPresetPreviewOfferingGroup>[] = [
  { title: translate('Type'), render: ({ row }) => <>{row.type}</> },
  {
    title: translate('Category'),
    render: ({ row }) => <>{renderFieldOrDash(row.category)}</>,
  },
  {
    title: translate('Offerings'),
    render: ({ row }) => <>{row.names.join(', ')}</>,
  },
];

const Offerings: FC<{ offerings: DemoPresetPreviewOfferingGroup[] }> = ({
  offerings,
}) =>
  offerings.length ? (
    <SimpleTable<DemoPresetPreviewOfferingGroup>
      columns={offeringColumns}
      rows={offerings}
      rowKey="type"
    />
  ) : (
    <EmptyState size="sm" message={translate('No offerings.')} />
  );

const SOURCE_LABELS: Record<string, () => string> = {
  preset: () => translate('Preset'),
  overlay: () => translate('Overlay'),
  default: () => translate('Default'),
  deployment: () => translate('Deployment'),
};

const SettingValue: FC<{ change: DemoPresetPreviewSettingChange; value }> = ({
  change,
  value,
}) => {
  if (change.secret) {
    return <span className="text-quaternary">{translate('Secret')}</span>;
  }
  if (value === null || value === undefined || value === '') {
    return <span className="text-quaternary">—</span>;
  }
  return typeof value === 'string' ? (
    <span className="break-words">{value}</span>
  ) : (
    <Code className="break-all">{JSON.stringify(value)}</Code>
  );
};

const settingColumns: Column<DemoPresetPreviewSettingChange>[] = [
  {
    title: translate('Setting'),
    render: ({ row }) => <span className="font-medium">{row.key}</span>,
  },
  {
    title: translate('Now'),
    render: ({ row }) => (
      <SettingValue change={row} value={row.current_value} />
    ),
  },
  {
    title: translate('After the load'),
    render: ({ row }) => <SettingValue change={row} value={row.new_value} />,
  },
  {
    title: translate('Source'),
    render: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        <Badge variant="neutral" shape="pill" tone="outline">
          {SOURCE_LABELS[row.source]?.() ?? row.source}
        </Badge>
        {row.skipped && (
          <Badge variant="warning" shape="pill" tone="outline">
            {translate('Kept')}
          </Badge>
        )}
        {!row.changed && !row.skipped && (
          <Badge variant="neutral" shape="pill" tone="outline">
            {translate('Unchanged')}
          </Badge>
        )}
      </div>
    ),
  },
];

const FeatureValue: FC<{ value: boolean }> = ({ value }) => (
  <Badge variant={value ? 'success' : 'neutral'} shape="pill" tone="outline">
    {value ? translate('On') : translate('Off')}
  </Badge>
);

const featureColumns: Column<DemoPresetPreviewFeatureChange>[] = [
  {
    title: translate('Feature'),
    render: ({ row }) => <span className="font-medium">{row.key}</span>,
  },
  {
    title: translate('Now'),
    render: ({ row }) => <FeatureValue value={row.current_value} />,
  },
  {
    title: translate('After the load'),
    render: ({ row }) => <FeatureValue value={row.new_value} />,
  },
  {
    title: translate('Source'),
    render: ({ row }) => (
      <Badge variant="neutral" shape="pill" tone="outline">
        {SOURCE_LABELS[row.source]?.() ?? row.source}
      </Badge>
    ),
  },
];

const ENTITY_LABELS: Record<string, () => string> = {
  users: () => translate('Users'),
  customers: () => translate('Organizations'),
  projects: () => translate('Projects'),
  offerings: () => translate('Offerings'),
  resources: () => translate('Resources'),
  categories: () => translate('Categories'),
  orders: () => translate('Orders'),
};

const Overview: FC<{ preview: Preview }> = ({ preview }) => (
  <>
    {preview.warnings.length > 0 && (
      <div className="mb-6 space-y-2">
        {preview.warnings.map((warning) => (
          <AlertItem
            key={warning}
            variant="warning"
            type="floating"
            iconSize="md"
            title={warning}
          />
        ))}
      </div>
    )}
    {preview.description && (
      <p className="mb-6 text-secondary">{preview.description}</p>
    )}
    <PropertyList variant="summary" termWidth="md">
      <PropertyItem
        label={translate('Name')}
        value={propVal.code(preview.name)}
      />
      <PropertyItem label={translate('Version')} value={preview.version} />
      <PropertyItem
        label={translate('Overlay')}
        value={preview.overlay}
        description={translate(
          'The deployment’s own preset, imported after this one on every load.',
        )}
      />
      {Object.keys(ENTITY_LABELS)
        .filter((key) => preview.entity_counts[key])
        .map((key) => (
          <PropertyItem
            key={key}
            label={ENTITY_LABELS[key]()}
            value={propVal.count(preview.entity_counts[key])}
          />
        ))}
    </PropertyList>
    {preview.scenarios.length > 0 && (
      <Section title={translate('Scenarios')}>
        <ul className="ml-4 list-disc space-y-1 text-secondary">
          {preview.scenarios.map((scenario) => (
            <li key={scenario}>{scenario}</li>
          ))}
        </ul>
      </Section>
    )}
  </>
);

const PreviewTabs: FC<{ preview: Preview }> = ({ preview }) => {
  const overlay = preview.overlay_contents;
  const changedSettings = preview.settings_changes.length;
  const changedFeatures = preview.feature_changes.length;
  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">{translate('Overview')}</TabsTrigger>
        <TabsTrigger value="users">
          {translate('Users')} ({preview.users.length})
        </TabsTrigger>
        <TabsTrigger value="structure">{translate('Structure')}</TabsTrigger>
        <TabsTrigger value="offerings">{translate('Offerings')}</TabsTrigger>
        <TabsTrigger value="settings">
          {translate('Settings')} ({changedSettings + changedFeatures})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Overview preview={preview} />
      </TabsContent>
      <TabsContent value="users">
        <p className="mb-3 text-secondary">
          {translate(
            'Passwords of staff and support users are never shown. Staff sign in with the password the deployment sets, when it sets one.',
          )}
        </p>
        <UsersTable users={preview.users} />
        {overlay && overlay.users.length > 0 && (
          <Section
            className="mt-6"
            title={<OverlayTitle overlay={preview.overlay} />}
          >
            <UsersTable users={overlay.users} withPasswords={false} />
          </Section>
        )}
      </TabsContent>
      <TabsContent value="structure">
        <Organizations organizations={preview.organizations} />
        {overlay && overlay.organizations.length > 0 && (
          <Section
            className="mt-6"
            title={<OverlayTitle overlay={preview.overlay} />}
          >
            <Organizations organizations={overlay.organizations} />
          </Section>
        )}
      </TabsContent>
      <TabsContent value="offerings">
        <Offerings offerings={preview.offerings} />
        {overlay && overlay.offerings.length > 0 && (
          <Section
            className="mt-6"
            title={<OverlayTitle overlay={preview.overlay} />}
          >
            <Offerings offerings={overlay.offerings} />
          </Section>
        )}
      </TabsContent>
      <TabsContent value="settings">
        <p className="mb-3 text-secondary">
          {translate(
            'A load returns every feature and every setting the deployment does not own to its default, then applies the preset’s values and the overlay’s. Settings the deployment owns keep their value.',
          )}
        </p>
        <Section title={translate('Features')}>
          {changedFeatures ? (
            <SimpleTable<DemoPresetPreviewFeatureChange>
              columns={featureColumns}
              rows={preview.feature_changes}
              rowKey="key"
            />
          ) : (
            <EmptyState size="sm" message={translate('No feature changes.')} />
          )}
        </Section>
        <Section title={translate('Settings')}>
          {changedSettings ? (
            <SimpleTable<DemoPresetPreviewSettingChange>
              columns={settingColumns}
              rows={preview.settings_changes}
              rowKey="key"
            />
          ) : (
            <EmptyState size="sm" message={translate('No setting changes.')} />
          )}
        </Section>
      </TabsContent>
    </Tabs>
  );
};

/** What loading the preset `name` would do, shown in the drawer. */
export const DemoPresetPreview: FC<{ name: string }> = ({ name }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: demoPresetPreviewQueryKey(name),
    queryFn: () =>
      marketplaceDemoPresetsInfoRetrieve({ path: { name } }).then(
        ({ data }) => data,
      ),
    meta: { skipGlobalErrorRedirect: true },
  });
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return (
      <LoadingErred
        loadData={refetch}
        message={translate('Unable to load the preview.')}
      />
    );
  }
  return <PreviewTabs preview={data} />;
};

/** The drawer's footer: loads the previewed preset. */
export const DemoPresetPreviewFooter: FC<{
  name: string;
  presetTitle: string;
  close: () => void;
}> = ({ name, presetTitle, close }) => (
  <div className="flex w-full justify-end">
    <LoadDemoPresetButton name={name} title={presetTitle} onStarted={close} />
  </div>
);
