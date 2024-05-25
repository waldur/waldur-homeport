import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { get, parseResultCount } from '@waldur/core/api';
import { Resource } from '@waldur/marketplace/resources/types';
import { Customer, Project } from '@waldur/workspace/types';

export const useSearch = () => {
  const [query, setQuery] = useState('');

  const result = useQuery(
    [`global-search`, query],
    async ({ signal }) => {
      const organizationsPromise = get<Customer[]>('/customers/', {
        signal,
        params: {
          query: query,
          field: ['name', 'display_name', 'uuid', 'abbreviation', 'image'],
        },
      });
      const projectsPromise = get<Project[]>('/projects/', {
        signal,
        params: {
          query: query,
          field: ['name', 'uuid', 'image', 'customer_name'],
        },
      });
      const resourcesPromise = get<Resource[]>('/marketplace-resources/', {
        signal,
        params: {
          query: query,
          state: ['Creating', 'OK', 'Erred', 'Updating', 'Terminating'],
          field: [
            'name',
            'uuid',
            'category_title',
            'offering_thumbnail',
            'customer_name',
            'project_name',
            'project_uuid',
            'state',
          ],
        },
      });
      const res = await Promise.all([
        organizationsPromise,
        projectsPromise,
        resourcesPromise,
      ]);

      const customersCount = parseResultCount(res[0]);
      const projectsCount = parseResultCount(res[1]);
      const resourcesCount = parseResultCount(res[2]);

      return {
        customers: res[0].data,
        customersCount,
        projects: res[1].data,
        projectsCount,
        resources: res[2].data,
        resourcesCount,
        resultsCount: customersCount + projectsCount + resourcesCount,
      };
    },
    { staleTime: 60 * 1000, keepPreviousData: true },
  );
  return { query, setQuery, result };
};

export type SearchResult = ReturnType<typeof useSearch>['result'];
