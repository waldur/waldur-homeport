/* eslint-disable jsx-a11y/anchor-is-valid */
import { UISrefActive, useRouter } from '@uirouter/react';
import { useMemo } from 'react';

import { Link } from '@waldur/core/Link';

import { getTabs } from '../useTabs';

export const UserDropdownMenuItems = () => {
  const router = useRouter();

  const items = useMemo(() => {
    const allStates = router.stateRegistry.get();
    const root = router.stateRegistry.get('profile');
    return getTabs(root, allStates);
  }, [router]);

  return (
    <>
      {items.map((item, index) => (
        <UISrefActive class="showing" key={index}>
          <div
            className="menu-item"
            data-kt-menu-trigger="hover"
            data-kt-menu-placement="left-start"
            data-kt-menu-flip="bottom"
          >
            {item.to ? (
              <Link state={item.to} className="menu-link">
                <span className="menu-title">{item.title}</span>
              </Link>
            ) : (
              <a className="menu-link">{item.title}</a>
            )}
            {item.children?.length > 0 && (
              <div className="menu-sub menu-sub-dropdown w-175px py-2">
                {item.children.map((child, childIndex) => (
                  <div
                    key={childIndex}
                    className="menu-item"
                    data-kt-menu-trigger="click"
                  >
                    <Link state={child.to} className="menu-link">
                      <span className="menu-title">{child.title}</span>
                    </Link>
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
