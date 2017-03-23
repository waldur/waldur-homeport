export default function ncServiceUtils() {
  function getTypeDisplay(type) {
    if (type === 'OpenStackTenant') {
      type = 'OpenStack';
    }
    return type;
  }
  function getServiceIcon(type) {
    var type = getTypeDisplay(type);
    return 'static/images/appstore/icon-' + type.toLowerCase() + '.png';
  }
  return {
    getTypeDisplay: getTypeDisplay,
    getServiceIcon: getServiceIcon
  };
}
