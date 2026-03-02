import { translate } from '@waldur/i18n';

import { FooterDropdown } from './FooterDropdown';
import { MenuItem } from './MenuItem';

export const MobileMenu = ({ dynamicItems, tosItem }) => {
  const shouldGroup = dynamicItems.length >= 2;

  if (shouldGroup) {
    return (
      <FooterDropdown title={translate('More')}>
        {dynamicItems.map((item) => (
          <MenuItem key={item.id} {...item} className="px-3" />
        ))}
        <MenuItem {...tosItem} className="px-3" />
      </FooterDropdown>
    );
  }

  return (
    <>
      {dynamicItems.map((item) => (
        <MenuItem key={item.id} {...item} />
      ))}
      <MenuItem {...tosItem} />
    </>
  );
};
