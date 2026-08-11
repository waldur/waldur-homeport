export {
  MAX_PAGE_SIZE,
  getIconUrl,
  fixURL,
  fetchResultCount,
  parseSelectData,
  getNextPageUrl,
  getNextPageNumber,
  parseNextPage,
  getAllPages,
  formDataOptions,
  fileSerializer,
} from 'waldur-api-client';
export type { ProgressCallback } from 'waldur-api-client';

export {
  getAuthHeader,
  getHeaders,
  initApiClient,
  attachAuthHeader,
  resetAuthSessionTracking,
  handleUnauthorizedResponse,
  get,
  post,
} from 'waldur-auth-core';
