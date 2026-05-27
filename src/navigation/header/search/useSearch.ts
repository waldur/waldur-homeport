import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import {
  customersList,
  marketplaceResourcesList,
  projectsList,
  usersList,
} from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { SHORT_STALE_TIME } from '@/core/constants';
import { useUser } from '@/workspace/hooks';

const queryFn =
  (query) =>
  async ({ signal }) => {
    const organizationsPromise = customersList({
      signal,
      query: {
        query: query,
        field: ['name', 'display_name', 'uuid', 'abbreviation', 'image'],
      },
    });
    const projectsPromise = projectsList({
      signal,
      query: {
        query: query,
        field: ['name', 'uuid', 'image', 'customer_name', 'customer_uuid'],
      },
    });
    const resourcesPromise = marketplaceResourcesList({
      signal,
      query: {
        query: query,
        state: ['Creating', 'OK', 'Erred', 'Updating', 'Terminating'],
        field: [
          'name',
          'uuid',
          'category_title',
          'offering_thumbnail',
          'customer_name',
          'customer_uuid',
          'project_name',
          'project_uuid',
          'state',
        ],
      },
    });
    const [organizations, projects, resources] = await Promise.all([
      organizationsPromise,
      projectsPromise,
      resourcesPromise,
    ]);

    const customersCount = fetchResultCount(organizations);
    const projectsCount = fetchResultCount(projects);
    const resourcesCount = fetchResultCount(resources);

    return {
      customers: organizations.data,
      customersCount,
      projects: projects.data,
      projectsCount,
      resources: resources.data,
      resourcesCount,
      resultsCount: customersCount + projectsCount + resourcesCount,
    };
  };

type QueryResult = ReturnType<typeof queryFn>;

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const [activeTab, setActiveTab] = useState('all');
  const user = useUser();
  const isStaffOrSupportUser = user?.is_staff || user?.is_support;

  const handleClickOutside = useCallback(
    (e) => {
      const popup = document.getElementById('GlobalSearch');
      const input = document.getElementById('searchContainer');
      if (!popup || !input) {
        return;
      }
      if (!popup.contains(e.target) && !input.contains(e.target)) {
        setShow(false);
      }
    },
    [setShow],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const result = useQuery<{}, {}, Awaited<ReturnType<QueryResult>>>({
    queryKey: ['global-search', debouncedQuery],
    queryFn: queryFn(debouncedQuery),
    staleTime: SHORT_STALE_TIME,
    placeholderData: keepPreviousData,
    enabled: show && debouncedQuery.length > 0,
  });

  const usersResult = useQuery({
    queryKey: ['global-search-users', debouncedQuery],
    queryFn: async ({ signal }) => {
      const response = await usersList({
        signal,
        query: {
          query: debouncedQuery,
          field: [
            'uuid',
            'full_name',
            'email',
            'phone_number',
            'organization',
            'permissions',
            'is_active',
          ],
          page_size: 50,
        },
      });
      return {
        users: response.data,
        usersCount: fetchResultCount(response),
      };
    },
    enabled: show && isStaffOrSupportUser && debouncedQuery.length > 0,
    staleTime: SHORT_STALE_TIME,
    placeholderData: keepPreviousData,
  });

  return {
    query,
    setQuery,
    result,
    usersResult,
    show,
    setShow,
    activeTab,
    setActiveTab,
    isStaffOrSupportUser,
  };
};

export type SearchResult = ReturnType<typeof useSearch>['result'];
export type UsersSearchResult = ReturnType<typeof useSearch>['usersResult'];
