export const getResourceIcon = type => {
  let providerType = type.split('.')[0];
  if (providerType === 'OpenStackTenant') {
    providerType = 'OpenStack';
  }
  return 'images/appstore/icon-' + providerType.toLowerCase() + '.png';
};
