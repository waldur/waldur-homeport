export function getTypeDisplay(type) {
  if (type === 'OpenStackTenant') {
    type = 'OpenStack';
  }
  return type;
}

export function getServiceIcon(type) {
  return `images/appstore/icon-${getTypeDisplay(type).toLowerCase()}.png`;
}

export default function ncServiceUtils() {
  return { getTypeDisplay, getServiceIcon };
}
