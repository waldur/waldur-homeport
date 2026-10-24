import { UISrefActive, useRouter } from '@uirouter/react';
import { useMemo } from 'react';

import { Menu, MenuDisclosure } from 'waldur-ui';

import { translate } from '@/i18n';
import { NavMenuLink } from '@/navigation/NavMenu';

import { getTabs } from '../useTabs';

/**
 * The profile pages. A page with sub-pages (Credentials) is a section
 * with its pages in a flyout.
 */
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
            <MenuDisclosure.Section
              label={item.title}
              backLabel={translate('Back')}
              contentClassName="font-medium w-[175px] py-[0.5rem]"
            >
              {item.children.map((child, childIndex) => (
                <UISrefActive class="active" key={childIndex}>
                  <NavMenuLink state={child.to} label={child.title} />
                </UISrefActive>
              ))}
            </MenuDisclosure.Section>
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
