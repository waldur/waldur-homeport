import { UISref, UISrefActive } from '@uirouter/react';
import { useMemo } from 'react';

import { getUserTabs } from '@waldur/user/constants';

export const UserDropdownMenuItems = () => {
  const items = useMemo(() => getUserTabs(), []);
  return (
    <>
      {items.map((item, index) => (
        <UISrefActive class="showing" key={index}>
          <div
            className="menu-item px-5"
            data-kt-menu-trigger="hover"
            data-kt-menu-placement="left-start"
            data-kt-menu-flip="bottom"
          >
            {item.to ? (
              <UISref to={item.to}>
                <a className="menu-link px-5">{item.title}</a>
              </UISref>
            ) : (
              <a className="menu-link px-5">{item.title}</a>
            )}
            {item.children && (
              <div className="menu-sub menu-sub-dropdown w-175px py-4">
                {item.children.map((child, childIndex) => (
                  <div key={childIndex} className="menu-item px-3">
                    <UISref to={child.to}>
                      <a className="menu-link px-5">{child.title}</a>
                    </UISref>
                  </div>
                ))}
              </div>
            )}
          </div>
        </UISrefActive>
      ))}
    </>
  );
};
