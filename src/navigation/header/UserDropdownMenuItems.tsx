import { UISrefActive, useRouter } from '@uirouter/react';
import { useMemo } from 'react';

import { Menu } from 'waldur-ui';

import { NavMenuLink } from '@/navigation/NavMenu';

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
      {items.map((item, index) =>
        item.children?.length > 0 ? (
          <UISrefActive class="active" key={index}>
            <Menu.Sub>
              <Menu.SubTrigger>{item.title}</Menu.SubTrigger>
              <Menu.SubContent className="fw-bold w-175px py-2">
                {item.children.map((child, childIndex) => (
                  <UISrefActive class="active" key={childIndex}>
                    <NavMenuLink state={child.to} label={child.title} />
                  </UISrefActive>
                ))}
              </Menu.SubContent>
            </Menu.Sub>
          </UISrefActive>
        ) : (
          <UISrefActive class="active" key={index}>
            {item.to ? (
              <NavMenuLink state={item.to} label={item.title} />
            ) : (
              <Menu.Item>{item.title}</Menu.Item>
            )}
          </UISrefActive>
        ),
      )}
    </>
  );
};
