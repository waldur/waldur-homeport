import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { Sidebar } from '@waldur/navigation/sidebar/Sidebar';
import { SidebarMenuProps } from '@waldur/navigation/sidebar/types';
import { mergeItems, getCounterFields } from '@waldur/navigation/sidebar/utils';
import { getProject } from '@waldur/workspace/selectors';

import { updateProjectCounters } from './actions';
import { getProjectCountersSelector } from './store';
import {
  getSidebarItems,
  getProjectCounters,
  getExtraSidebarItems,
} from './utils';

export const ProjectSidebar: FunctionComponent = () => {
  const dispatch = useDispatch();
  const project = useSelector(getProject);
  const sidebarItems = useSelector(getSidebarItems);

  // Get the sidebar counters separately
  const counters = useSelector(getProjectCountersSelector);

  const { value } = useAsync<SidebarMenuProps>(async () => {
    const extraItems = await getExtraSidebarItems();
    const items = mergeItems(sidebarItems.filter(Boolean), extraItems);
    const fields = getCounterFields(items);
    const counters = await getProjectCounters(project, fields);

    dispatch(updateProjectCounters(counters));

    return { items };
  }, [project]);

  return <Sidebar items={value?.items} counters={counters?.counters} />;
};
