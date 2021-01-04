import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { customerCreateDialog } from '@waldur/customer/create/actions';
import { closeModalDialog } from '@waldur/modal/actions';
import { getConfig } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import { getUser } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

export const useCreateOrganization = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const ownerCanManage = useSelector(
    (state: RootState) =>
      getConfig(state).plugins.WALDUR_CORE.OWNER_CAN_MANAGE_CUSTOMER,
  );
  const canCreateOrganization = user.is_staff || ownerCanManage;
  const createOrganization = () => {
    dispatch(closeModalDialog());
    dispatch(customerCreateDialog());
  };
  return [canCreateOrganization, createOrganization];
};

const filterProject = (project: Project, filter: string): boolean => {
  /* Filter project by name using case-insensitive partial metch */
  if (!filter) {
    return true;
  }
  if (project.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
    return true;
  }
  return false;
};

export const useProjectFilter = (projects: Project[]) => {
  const [filter, setFilter] = useState('');
  const filteredProjects = useMemo(
    () =>
      projects
        ? projects.filter((project) => filterProject(project, filter))
        : [],
    [filter, projects],
  );
  return { filter, setFilter, filteredProjects };
};
