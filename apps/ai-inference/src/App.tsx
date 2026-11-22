import {
  ChartPieSliceIcon,
  CubeIcon,
  KeyIcon,
  SquaresFourIcon,
} from '@phosphor-icons/react';
import { useEffect } from 'react';
import { translate } from 'waldur-i18n-runtime';
import { AppShell } from 'waldur-shell';
import {
  BaseButton,
  EmptyState,
  LinkProvider,
  LoadingSpinner,
  SidebarMenuTree,
  SidebarNavItem,
  SidebarSection,
  WaldurLogo,
} from 'waldur-ui';

import { ROOT_APP_URL } from './links';
import { AddServicePage } from './pages/AddServicePage';
import { KeysPage } from './pages/KeysPage';
import { ModelsPage } from './pages/ModelsPage';
import { OverviewPage } from './pages/OverviewPage';
import { UsagePage } from './pages/UsagePage';
import { useProjects } from './queries';
import {
  isAppHref,
  navigate,
  onLinkClick,
  replace,
  SectionKey,
  sectionHref,
  useRoute,
} from './router';

// LinkProvider contract: an empty link the caller fills. This app's pages
// navigate client-side; the portal's are plain links.
const renderLink = (to: string) => (
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  <a href={to} onClick={isAppHref(to) ? onLinkClick(to) : undefined} />
);

const SECTIONS: { key: SectionKey; label: () => string; icon: JSX.Element }[] =
  [
    {
      key: 'overview',
      label: () => translate('Overview'),
      icon: <SquaresFourIcon size={20} weight="bold" />,
    },
    {
      key: 'models',
      label: () => translate('Models'),
      icon: <CubeIcon size={20} weight="bold" />,
    },
    {
      key: 'keys',
      label: () => translate('API keys'),
      icon: <KeyIcon size={20} weight="bold" />,
    },
    {
      key: 'usage',
      label: () => translate('Usage & limits'),
      icon: <ChartPieSliceIcon size={20} weight="bold" />,
    },
  ];

export const App = () => {
  const route = useRoute();
  const projects = useProjects();
  const list = projects.data ?? [];
  const project =
    list.find((item) => item.uuid === route.projectUuid) ?? list[0];

  // The app's root shows the first project: put it in the URL, so a link to
  // the page shows the same project.
  useEffect(() => {
    if (project && project.uuid !== route.projectUuid) {
      replace(sectionHref(project.uuid, route.section));
    }
  }, [project, route.projectUuid, route.section]);

  return (
    <LinkProvider renderLink={renderLink}>
      <AppShell
        appName="ai-inference"
        logoutHref={`${ROOT_APP_URL.replace(/\/$/, '')}/logout/`}
        logo={<WaldurLogo />}
        sidebarContent={
          list.length ? (
            <SidebarSection label={translate('PROJECTS')}>
              <SidebarMenuTree
                items={list.map((item) => ({
                  id: item.uuid,
                  title: item.name,
                  children: SECTIONS.map((section) => ({
                    id: `${item.uuid}:${section.key}`,
                    title: section.label(),
                  })),
                }))}
                // The selected project stays open; opening another moves to it.
                openId={project?.uuid}
                onToggle={(id) => (open) => {
                  if (open) navigate(sectionHref(id, 'overview'));
                }}
                maxVisibleItems={8}
                moreLabel={(count) => translate('Show {count} more', { count })}
                lessLabel={translate('Show less')}
                renderItem={(item) => {
                  const [projectUuid, key] = item.id.split(':') as [
                    string,
                    SectionKey,
                  ];
                  const section = SECTIONS.find((s) => s.key === key);
                  return (
                    <SidebarNavItem
                      key={item.id}
                      icon={section.icon}
                      label={section.label()}
                      active={
                        projectUuid === project?.uuid && key === route.section
                      }
                      onClick={() => navigate(sectionHref(projectUuid, key))}
                    />
                  );
                }}
              />
            </SidebarSection>
          ) : null
        }
      >
        {projects.isLoading ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : projects.isError ? (
          <div className="p-6">
            <EmptyState
              title={translate('Could not load your projects')}
              message={translate('Check your connection and try again.')}
              action={
                <BaseButton
                  variant="tertiary"
                  label={translate('Try again')}
                  onClick={() => projects.refetch()}
                />
              }
            />
          </div>
        ) : !project ? (
          <div className="p-6">
            <EmptyState
              title={translate('You are not in any project yet')}
              message={translate(
                'Inference services are ordered for projects. Ask your organisation to add you to one.',
              )}
            />
          </div>
        ) : route.section === 'models' ? (
          <ModelsPage key={project.uuid} project={project} />
        ) : route.section === 'keys' ? (
          <KeysPage key={project.uuid} project={project} />
        ) : route.section === 'add' ? (
          <AddServicePage key={project.uuid} project={project} />
        ) : route.section === 'usage' ? (
          <UsagePage key={project.uuid} project={project} />
        ) : (
          <OverviewPage key={project.uuid} project={project} />
        )}
      </AppShell>
    </LinkProvider>
  );
};
