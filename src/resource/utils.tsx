import { detectOS, formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const getResourceAccessEndpoints = (resource, offering) => {
  const os = detectOS();
  let endpoints = [
    ...(resource.endpoints || []),
    ...(offering.endpoints || []),
  ];
  if (os === 'Windows') {
    endpoints = endpoints.filter((endpoint) => !isSshFormat(endpoint.url));
  }
  return endpoints;
};

export const isSshFormat = (url) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'ssh:';
  } catch {
    return false;
  }
};

const RESOURCE_TYPE_LABELS = {
  'VMware.VirtualMachine': translate('vSphere virtual machine'),
  'VMware.Disk': translate('VM disk'),
  'VMware.Port': translate('VM network adapter'),
  'SLURM.Allocation': translate('Batch processing allocation'),
};

export const formatResourceType = (resource) => {
  if (!resource.resource_type) return '';
  if (RESOURCE_TYPE_LABELS[resource.resource_type]) {
    return RESOURCE_TYPE_LABELS[resource.resource_type];
  }
  const parts = resource.resource_type.split('.');
  return parts[0] + ' ' + parts[1];
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
