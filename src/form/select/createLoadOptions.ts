import { createLoadOptions as createLoadOptionsApiClient } from 'waldur-api-client';

import { ENV } from '@/core/config';

export const createLoadOptions: typeof createLoadOptionsApiClient = (
  listMethod,
  searchField,
  extraQuery,
  pathParams,
  pageSize = ENV.pageSize,
) =>
  createLoadOptionsApiClient(
    listMethod,
    searchField,
    extraQuery,
    pathParams,
    pageSize,
  );
