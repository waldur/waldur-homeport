import { get } from '@waldur/core/api';
import { Tip } from '@waldur/core/Tooltip';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { getTypeDisplay, getServiceIcon } from '@waldur/providers/registry';
import { formatCrontab } from '@waldur/resource/crontab';
import { ResourceSummaryProps } from '@waldur/resource/summary';
import { Schedule } from '@waldur/resource/types';

export const getResourceIcon = (type) => getServiceIcon(type.split('.')[0]);

const RESOURCE_TYPE_LABELS = {};

export function registerResourceTypeLabel(resourceType: string, label: string) {
  RESOURCE_TYPE_LABELS[resourceType] = label;
}

export const formatResourceType = (resource) => {
  if (RESOURCE_TYPE_LABELS[resource.resource_type]) {
    return RESOURCE_TYPE_LABELS[resource.resource_type];
  }
  const parts = resource.resource_type.split('.');
  const service = getTypeDisplay(parts[0]);
  return service + ' ' + parts[1];
};

export const formatFlavor = (limits) => {
  const parts = [
    {
      label: translate('vCPU'),
      value: limits.cores,
    },
    {
      label: translate('RAM'),
      value: limits.ram && formatFilesize(limits.ram),
    },
  ];

  return parts
    .filter((part) => part.value)
    .map((part) => `${part.value} ${part.label}`)
    .join(', ');
};

export const formatSummary = (resource) => {
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

export const formatDefault = (value) => value || <>&mdash;</>;

export const formatCommaList = (items: string[]) =>
  items.length === 0 ? <>&ndash;</> : items.join(', ');

export const formatSchedule = ({ resource }) => (
  <Tip label={resource.schedule} id="scheduleTooltip">
    {formatCrontab(resource.schedule)}
  </Tip>
);

export const formatRetentionTime = (props: ResourceSummaryProps<Schedule>) =>
  props.resource.retention_time === 0
    ? translate('Keep forever')
    : translate('{number} days', {
        number: props.resource.retention_time,
      });

export const getData = async (url) => {
  try {
    return await get(url).then((response) => response.data);
  } catch (e) {
    return null;
  }
};
