import { getList } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';
import { parseResponse } from '@waldur/table-react/api';
import { Fetcher, TableRequest } from '@waldur/table-react/types';

export const fetchProjectUsers: Fetcher = (request: TableRequest) => {
  const { project_uuid, ...rest } = request.filter;
  const url = `${ENV.apiEndpoint}api/projects/${project_uuid}/users/`;
  const params = {
    page: request.currentPage,
    page_size: request.pageSize,
    ...rest,
  };
  return parseResponse(url, params);
};

export const fetchProjectManagers = (user, project) =>
  getList('/project-permissions/', {
    user_url: user.url,
    project: project.uuid,
    role: 'manager',
  });
