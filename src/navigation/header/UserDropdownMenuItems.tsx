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

// NavMenuSubContent's own `menu-gray-600 menu-state-bg-gray` (matching
// UserDropdown.tsx's own outer NavMenuContent) — not inherited from that
// ancestor despite the visual JSX nesting: Radix portals this Content to
// document.body, breaking the CSS descendant-selector chain the
// menu-state-bg-gray mixins rely on. Without it, hover/[data-highlighted]
// and .active states have no color styling at all here — the current
// item never highlights. Reported live for the sibling
// LanguageSelectorDropdown.tsx, same root cause here.
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
            <NavMenuSub>
              <NavMenuSubTrigger>
                {item.to ? (
                  <span className="menu-title">{item.title}</span>
                ) : (
                  item.title
                )}
              </NavMenuSubTrigger>
              <NavMenuSubContent className="menu-gray-600 menu-state-bg-gray w-175px py-2">
                {item.children.map((child, childIndex) => (
                  <UISrefActive class="active" key={childIndex}>
                    <NavMenuItem asChild>
                      <Link state={child.to}>
                        <span className="menu-title">{child.title}</span>
                      </Link>
                    </NavMenuItem>
                  </UISrefActive>
                ))}
              </NavMenuSubContent>
            </NavMenuSub>
          </UISrefActive>
        ) : (
          <UISrefActive class="active" key={index}>
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
