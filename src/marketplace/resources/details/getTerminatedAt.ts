import { Resource } from 'waldur-js-client';

import { formatDateTime, formatRelative } from '@/core/dateUtils';

/**
 * The moment a Terminated resource was terminated, if it is known. The backend
 * keeps the value while a restore is in progress, as that may yet be refused,
 * so it says nothing unless the resource is Terminated.
 */
export const getTerminatedAt = (resource: Resource) =>
  resource.state === 'Terminated' ? resource.terminated_at || null : null;

export const formatTerminatedAt = (terminatedAt: string) =>
  `${formatDateTime(terminatedAt)} (${formatRelative(terminatedAt)})`;
