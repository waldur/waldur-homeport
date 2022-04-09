import { FunctionComponent } from 'enzyme';

import { MenuItem } from './MenuItem';
import { SidebarSection } from './types';

export const MenuSection: FunctionComponent<SidebarSection> = ({
  label,
  items,
}) => (
  <>
    <div className="menu-item">
      <div className="menu-content pt-8 pb-0">
        <span className="menu-section text-muted text-uppercase fs-8 ls-1">
          {label}
        </span>
      </div>
    </div>
    {items.map((item, itemIndex) => (
      <MenuItem key={itemIndex} item={item} />
    ))}
  </>
);
