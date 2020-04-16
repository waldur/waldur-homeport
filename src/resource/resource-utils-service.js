import { getResourceIcon, formatResourceType } from './utils';

const getIcon = item => {
  const type = item.resource_type || item.type;
  if (type) {
    return getResourceIcon(type);
  }
  return null;
};

// @ngInject
export default function resourceUtils() {
  return { formatResourceType, getIcon };
}
