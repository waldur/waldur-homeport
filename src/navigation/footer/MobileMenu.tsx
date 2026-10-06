import { translate } from '@/i18n';

import { FooterDropdown } from './FooterDropdown';
import { FooterDropdownLink } from './FooterDropdownItems';
import { MenuItem } from './MenuItem';

export const MobileMenu = ({ dynamicItems }) => {
  const shouldGroup = dynamicItems.length >= 2;

  if (shouldGroup) {
    return (
      <FooterDropdown title={translate('More')}>
        {dynamicItems.map((item) => (
          <FooterDropdownLink
            key={item.id}
            label={item.label}
            state={item.state}
          />
        ))}
      </FooterDropdown>
    );
  }

  return dynamicItems.map((item) => <MenuItem key={item.id} {...item} />);
};
