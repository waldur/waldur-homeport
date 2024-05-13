import { FC, PropsWithChildren, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { useExtraTabs, useToolbarActions } from '@waldur/navigation/context';
import { ProjectUsersBadge } from '@waldur/project/ProjectUsersBadge';
import { ResourceParentTab } from '@waldur/resource/tabs/types';

import { ResourceSpecGroupCard } from './ResourceSpecGroupCard';

const ProjectUsersList = lazyComponent(
  () => import('@waldur/project/team/ProjectUsersList'),
  'ProjectUsersList',
);

interface ResourceDetailsViewProps {
  resource;
  scope;
  offering;
  refetch;
  isLoading;
  tabs;
  tabSpec?: ResourceParentTab & {
    component?: ResourceParentTab['children'][0]['component'];
  };
}

export const HidableWrapper: FC<PropsWithChildren<{ activeTab; tabKey }>> = (
  props,
) => (
  <div className={props.activeTab !== props.tabKey ? 'd-none' : undefined}>
    {props.children}
  </div>
);

export const ResourceDetailsView: FC<ResourceDetailsViewProps> = ({
  resource,
  scope,
  offering,
  refetch,
  isLoading,
  tabs,
  tabSpec,
}) => {
  useExtraTabs(tabs);

  const dispatch = useDispatch();
  const openTeamModal = useCallback(() => {
    dispatch(openModalDialog(ProjectUsersList, { size: 'xl' }));
  }, [dispatch]);

  useToolbarActions(
    <ProjectUsersBadge
      compact
      max={3}
      className="col-auto align-items-center me-10"
      onClick={openTeamModal}
    />,
    [openTeamModal],
  );

  return tabSpec ? (
    <div>
      {tabSpec.children?.length ? (
        <ResourceSpecGroupCard
          tabKey={tabSpec.key}
          tabs={tabSpec.children}
          title={tabSpec.title}
          resource={resource}
          resourceScope={scope}
          refetch={refetch}
          isLoading={isLoading}
        />
      ) : (
        <tabSpec.component
          resource={resource}
          resourceScope={scope}
          offering={offering}
          title={tabSpec.title}
          refetch={refetch}
          isLoading={isLoading}
        />
      )}
    </div>
  ) : null;
};
