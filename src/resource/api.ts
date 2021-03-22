import { getById } from '@waldur/core/api';

import { RESOURCE_ENDPOINTS } from './constants';
import { Resource } from './types';

export const getResource = (resource_type, id) =>
  getById<Resource>(RESOURCE_ENDPOINTS[resource_type], id);
