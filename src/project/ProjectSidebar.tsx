import * as React from 'react';
import { useSelector } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';

import { Sidebar } from '@waldur/navigation/sidebar/Sidebar';
import { SidebarMenuProps } from '@waldur/navigation/sidebar/types';
import { mergeItems, getCounterFields } from '@waldur/navigation/sidebar/utils';
import { getProject } from '@waldur/workspace/selectors';

import {
  getSidebarItems,
  getProjectCounters,
  getExtraSidebarItems,
} from './utils';

export const ProjectSidebar = () => {
  const project = useSelector(getProject);
  const sidebarItems = useSelector(getSidebarItems);

  const { value } = useAsync<SidebarMenuProps>(async () => {
    const extraItems = await getExtraSidebarItems();
    const items = mergeItems(sidebarItems, extraItems);
    const fields = getCounterFields(items);
    const counters = await getProjectCounters(project, fields);
    return { items, counters };
  }, [project]);

  return <Sidebar items={value?.items} counters={value?.counters} />;
};
