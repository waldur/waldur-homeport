import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'enzyme';

import { MenuItem } from './MenuItem';
import { MenuItemType, SidebarSection } from './types';

export const MenuSection: FunctionComponent<SidebarSection> = ({
  label,
  items,
}) => {
  const router = useRouter();

  const onClick = (item: MenuItemType) => {
    if (item.action) {
      item.action();
    } else if (item.state) {
      router.stateService.go(item.state, item.params);
    }
  };

  return (
    <>
      <div className="menu-item">
        <div className="menu-content pt-8 pb-0">
          <span className="menu-section text-muted text-uppercase fs-8 ls-1">
            {label}
          </span>
        </div>
      </div>
      {items.map((item, itemIndex) => (
        <MenuItem key={itemIndex} item={item} onClick={onClick} />
      ))}
    </>
  );
};
