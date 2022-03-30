import React, { Fragment } from 'react';

import { MenuSection } from './MenuSection';
import { SidebarMenuProps } from './types';

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ sections }) => {
  return (
    <Fragment>
      {sections
        .filter((section) => section.items.length > 0)
        .map((section, sectionIndex) => (
          <MenuSection key={sectionIndex} {...section} />
        ))}
    </Fragment>
  );
};

SidebarMenu.defaultProps = {
  sections: [],
};
