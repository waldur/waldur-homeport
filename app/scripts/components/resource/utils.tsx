import * as React from 'react';

import { formatFilesize } from '@waldur/core/utils';
import { getTypeDisplay, getServiceIcon } from '@waldur/providers/utils';

export const getResourceIcon = type =>
  getServiceIcon(type.split('.')[0]);

export const formatResourceType = resource => {
  const parts = resource.resource_type.split('.');
  const service = getTypeDisplay(parts[0]);
  return service + ' ' + parts[1];
};

const LIST_STATES = {
  apps: 'project.resources.apps',
  private_clouds: 'project.resources.clouds',
  storages: 'project.resources.storage.tabs',
  vms: 'project.resources.vms',
};

export const getListState = category =>
  LIST_STATES[category] || 'project.resources.vms';

export const formatFlavor = resource => {
  const storage = resource.disk || resource.storage;
  const parts = [
    {
      label: 'vCPU',
      value: resource.cores,
    },
    {
      label: 'RAM',
      value: resource.ram && formatFilesize(resource.ram),
    },
    {
      label: 'storage',
      value: storage && formatFilesize(storage),
    },
  ];
  return parts
    .filter(part => part.value)
    .map(part => `${part.value} ${part.label}`)
    .join(', ');
};

export const formatSummary = resource => {
  const parts = [];
  if (resource.image_name) {
    parts.push(resource.image_name);
  }
  const flavor = formatFlavor(resource);
  if (flavor) {
    parts.push(flavor);
  }
  const summary = parts.join(', ');
  return summary;
};

export const formatDefault = value => value || <span>&mdash;</span>;

export const formatCommaList = (items: string []) =>
  items.length === 0 ? <span>&ndash;</span> : items.join(', ');
