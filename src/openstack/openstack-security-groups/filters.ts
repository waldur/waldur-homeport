import {
  formatSecurityGroupRulePortRange,
  formatSecurityGroupProtocol,
  formatSecurityGroupCIDR,
} from './utils';

export default module => {
  module.filter(
    'securityGroupRulePortRange',
    () => formatSecurityGroupRulePortRange,
  );
  module.filter('securityGroupCIDR', () => formatSecurityGroupCIDR);
  module.filter('securityGroupProtocol', () => formatSecurityGroupProtocol);
};
