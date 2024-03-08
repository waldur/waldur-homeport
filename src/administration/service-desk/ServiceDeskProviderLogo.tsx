const WaldurLogo = require('@waldur/images/logo.svg');

const AtlassianLogo = require('./AtlassianLogo.svg');
const SMAXLogo = require('./OpentextLogo.svg');
const ZammadLogo = require('./ZammadLogo.svg');

export const ServiceDeskProviderLogo = ({ name }) => {
  if (name === 'atlassian') {
    return <img src={AtlassianLogo} style={{ width: '100%' }} alt={name} />;
  } else if (name === 'zammad') {
    return <img src={ZammadLogo} style={{ width: '100%' }} alt={name} />;
  } else if (name === 'smax') {
    return <img src={SMAXLogo} style={{ width: '100%' }} alt={name} />;
  } else {
    return <img src={WaldurLogo} style={{ width: '100%' }} alt={name} />;
  }
};
