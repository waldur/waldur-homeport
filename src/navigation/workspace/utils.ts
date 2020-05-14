import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getAll } from '@waldur/core/api';
import { openModalDialog, closeModalDialog } from '@waldur/modal/actions';
import { getConfig } from '@waldur/store/config';
import { getUser } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

export const useCreateOrganization = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const ownerCanManage = useSelector(
    state => getConfig(state).plugins.WALDUR_CORE.OWNER_CAN_MANAGE_CUSTOMER,
  );
  const canCreateOrganization = user.is_staff || ownerCanManage;
  const createOrganization = () => {
    dispatch(closeModalDialog());
    dispatch(openModalDialog('customerCreateDialog', { size: 'lg' }));
  };
  return [canCreateOrganization, createOrganization];
};

const filterOrganization = (
  organization: Customer,
  filter: string,
): boolean => {
  /* Filter organization by name or abbreviation using case-insensitive partial metch */
  if (!filter) {
    return true;
  }
  if (organization.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
    return true;
  }
  if (
    organization.abbreviation.toLowerCase().indexOf(filter.toLowerCase()) >= 0
  ) {
    return true;
  }
  return false;
};

export const useOrganizationFilter = (organizations: Customer[]) => {
  const [filter, setFilter] = React.useState('');
  const filteredOrganizations = React.useMemo(
    () =>
      organizations.filter(organization =>
        filterOrganization(organization, filter),
      ),
    [filter, organizations],
  );
  return { filter, setFilter, filteredOrganizations };
};

export const loadOrganizations = () =>
  getAll<Customer>('/customers/', {
    params: {
      field: [
        'name',
        'uuid',
        'projects',
        'owners',
        'abbreviation',
        'is_service_provider',
      ],
      o: 'name',
    },
  });

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
  const [filter, setFilter] = React.useState();
  const filteredProjects = React.useMemo(
    () =>
      projects
        ? projects.filter(project => filterProject(project, filter))
        : [],
    [filter, projects],
  );
  return { filter, setFilter, filteredProjects };
};
