import WaldurLogo from '@waldur/images/logo.svg';

import AtlassianLogo from './AtlassianLogo.svg';
import SMAXLogo from './OpentextLogo.svg';
import ZammadLogo from './ZammadLogo.svg';

const LogoMap = {
  atlassian: AtlassianLogo,
  zammad: ZammadLogo,
  smax: SMAXLogo,
  waldur: WaldurLogo,
};

export const ServiceDeskProviderLogo = ({ name }) => {
  const Logo = LogoMap[name] || LogoMap.waldur;
  return <Logo style={{ width: '100%' }} />;
};
