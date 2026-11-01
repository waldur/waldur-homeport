import { limitAsync } from 'es-toolkit';
import { projectsList, projectsListUsersList } from 'waldur-js-client';

import { RoleEnum } from '@/permissions/enums';
import { createFetcher } from '@/table/api';
import { Fetcher } from '@/table/types';

/** Requested by the Administrators column. Not a project field: it switches the
 * lookup on, so a table with the column turned off pays nothing for it. */
export const ADMINISTRATORS_FIELD = 'administrators';

// An all-pages export looks up every project it holds, not just one page.
const MAX_CONCURRENT_LOOKUPS = 8;

const fetchProjects = createFetcher(projectsList);

const fetchAdministrators = limitAsync(
  async (project: string, signal?: AbortSignal) => {
    const { data } = await projectsListUsersList({
      path: { uuid: project },
      query: {
        role_template: [RoleEnum.PROJECT_ADMIN],
        field: ['user_full_name', 'user_email', 'user_username'],
        page_size: 100,
      },
      signal,
    });
    return data;
  },
  MAX_CONCURRENT_LOOKUPS,
);

export const fetchProjectsWithAdministrators: Fetcher = async (request) => {
  // An export nests each column's keys in this list.
  const fields: string[] | undefined = request.filter?.field?.flat();
  const page = await fetchProjects({
    ...request,
    filter: {
      ...request.filter,
      field: fields?.filter((field) => field !== ADMINISTRATORS_FIELD),
    },
  });
  if (!fields?.includes(ADMINISTRATORS_FIELD)) {
    return page;
  }
  const rows = await Promise.all(
    page.rows.map(async (project) => ({
      ...project,
      // The team of a project its viewer may list can still be refused to
      // them, so one lookup that fails must not take the table down with it.
      administrators: await fetchAdministrators(
        project.uuid,
        request.options?.signal,
      ).catch(() => undefined),
    })),
  );
  return { ...page, rows };
};
