/* eslint-disable waldur-custom/no-direct-client-usage */
import { get } from '@waldur/core/api';

interface Resource {
  name: string;
  username: string;
}

export interface Project {
  name: string;
  resources: Resource[];
}

export interface UserData {
  email: string;
  status: string;
  short_name?: string;
  invited_by?: string;
  reason?: string;
  projects: Record<string, Project>;
}

export const getAccessForEmail = async (query: string): Promise<UserData[]> => {
  const url = `/openportal/access_for_email/?q=${encodeURIComponent(query)}`;
  const response = await get(url);

  // Normalize response to always be an array of users
  if (Array.isArray(response)) {
    return response;
  }
  return [response];
};
