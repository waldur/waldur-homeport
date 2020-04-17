import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { getTypeDisplay, getServiceIcon } from '@waldur/providers/registry';
import { formatCrontab } from '@waldur/resource/crontab';
import { ResourceSummaryProps } from '@waldur/resource/summary';
import { Schedule } from '@waldur/resource/types';

export const getResourceIcon = type => getServiceIcon(type.split('.')[0]);

const RESOURCE_TYPE_LABELS = {};

export function registerResourceTypeLabel(resourceType: string, label: string) {
  RESOURCE_TYPE_LABELS[resourceType] = label;
}

export const formatResourceType = resource => {
  if (RESOURCE_TYPE_LABELS[resource.resource_type]) {
    return RESOURCE_TYPE_LABELS[resource.resource_type];
  }
  const parts = resource.resource_type.split('.');
  const service = getTypeDisplay(parts[0]);
  return service + ' ' + parts[1];
};

const formatStorage = limits => {
  const parts = [];
  const volumeTypes = Object.keys(limits).filter(
    key => key.startsWith('gigabytes_') && limits[key] > 0,
  );
  const hasVolumeTypes = volumeTypes.length > 0;
  if (hasVolumeTypes) {
    volumeTypes.forEach(key => {
      const label = key.split('gigabytes_', 2)[1].toLocaleUpperCase();
      parts.push({
        label,
        value: `${limits[key]} GB`,
      });
    });
  } else {
    const storage = limits.disk || limits.storage;
    parts.push({
      label: translate('storage'),
      value: storage && formatFilesize(storage),
    });
  }
  return parts;
};

export const formatFlavor = limits => {
  const parts = [
    {
      label: translate('vCPU'),
      value: limits.cores,
    },
    {
      label: translate('RAM'),
      value: limits.ram && formatFilesize(limits.ram),
    },
    ...formatStorage(limits),
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

export const formatCommaList = (items: string[]) =>
  items.length === 0 ? <span>&ndash;</span> : items.join(', ');

export const formatSchedule = ({ resource }) => (
  <Tooltip label={resource.schedule} id="scheduleTooltip">
    {formatCrontab(resource.schedule)}
  </Tooltip>
);

export const formatRetentionTime = (props: ResourceSummaryProps<Schedule>) =>
  props.resource.retention_time === 0
    ? props.translate('Keep forever')
    : props.translate('{number} days', {
        number: props.resource.retention_time,
      });
