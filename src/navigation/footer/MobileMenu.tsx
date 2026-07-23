import { translate } from '@/i18n';

import { FooterDropdown } from './FooterDropdown';
import { MenuItem } from './MenuItem';

export const MobileMenu = ({ dynamicItems }) => {
  const shouldGroup = dynamicItems.length >= 2;

  if (shouldGroup) {
    return (
      <FooterDropdown title={translate('More')}>
        {dynamicItems.map((item) => (
          <MenuItem key={item.id} {...item} className="px-3" />
        ))}
      </FooterDropdown>
    );
  }

  return dynamicItems.map((item) => <MenuItem key={item.id} {...item} />);
};
