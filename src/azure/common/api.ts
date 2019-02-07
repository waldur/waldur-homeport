import { getAll } from '@waldur/core/api';

import { Option, Image, Size } from './types';

// tslint:disable:variable-name
export const getLocations = (settings_uuid: string) =>
  getAll<Option>('/azure-locations/', {params: {settings_uuid}});

export const getImages = (settings_uuid: string) =>
  getAll<Image>('/azure-images/', {params: {settings_uuid}});

export const getSizes = (settings_uuid: string) =>
  getAll<Size>('/azure-sizes/', {params: {settings_uuid}});
