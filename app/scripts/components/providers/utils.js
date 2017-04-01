export default function ncServiceUtils() {
  function getTypeDisplay(type) {
    if (type === 'OpenStackTenant') {
      type = 'OpenStack';
    }
    return type;
  }
  function getServiceIcon(type) {
    return 'static/images/appstore/icon-' + getTypeDisplay(type).toLowerCase() + '.png';
  }
  return {
    getTypeDisplay: getTypeDisplay,
    getServiceIcon: getServiceIcon
  };
}
