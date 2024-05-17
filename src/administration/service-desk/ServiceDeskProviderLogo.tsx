import WaldurLogo from '@waldur/images/logo.svg';

import AtlassianLogo from './AtlassianLogo.svg';
import SMAXLogo from './OpentextLogo.svg';
import ZammadLogo from './ZammadLogo.svg';

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
