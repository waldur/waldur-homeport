import { UISrefActive, useRouter } from '@uirouter/react';
import { useMemo } from 'react';

import { Link } from '@/core/Link';
import {
  NavMenuItem,
  NavMenuSub,
  NavMenuSubContent,
  NavMenuSubTrigger,
} from '@/navigation/NavMenu';

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
          <UISrefActive class="showing" key={index}>
            <NavMenuSub>
              <NavMenuSubTrigger>
                {item.to ? (
                  <span className="menu-title">{item.title}</span>
                ) : (
                  item.title
                )}
              </NavMenuSubTrigger>
              <NavMenuSubContent className="w-175px py-2">
                {item.children.map((child, childIndex) => (
                  <NavMenuItem key={childIndex} asChild>
                    <Link state={child.to}>
                      <span className="menu-title">{child.title}</span>
                    </Link>
                  </NavMenuItem>
                ))}
              </NavMenuSubContent>
            </NavMenuSub>
          </UISrefActive>
        ) : (
          <UISrefActive class="showing" key={index}>
            <NavMenuItem asChild={Boolean(item.to)}>
              {item.to ? (
                <Link state={item.to}>
                  <span className="menu-title">{item.title}</span>
                </Link>
              ) : (
                <span>{item.title}</span>
              )}
            </NavMenuItem>
          </UISrefActive>
        ),
      )}
    </>
  );
};
