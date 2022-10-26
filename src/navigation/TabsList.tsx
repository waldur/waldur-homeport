import { UISref, UISrefActive, UISrefProps } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { useTabs } from './useTabs';

const MenuLink: FunctionComponent<UISrefProps> = ({ to, params, children }) =>
  to ? (
    <UISrefActive class="here">
      <UISref to={to} params={params}>
        {children}
      </UISref>
    </UISrefActive>
  ) : (
    children
  );

export const TabsList: FunctionComponent = () => {
  const tabs = useTabs();

  return (
    <>
      {tabs.map((parentTab, parentIndex) =>
        parentTab.children?.length > 0 ? (
          <MenuLink key={parentIndex} to={parentTab.to}>
            <a
              data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
              data-kt-menu-placement="bottom-start"
              className="menu-item menu-lg-down-accordion menu-sub-lg-down-indention me-0 me-lg-2"
            >
              <span className="menu-link">
                <span className="menu-title">{parentTab.title}</span>
                <span className="menu-arrow d-lg-none"></span>
              </span>
              <div className="menu-sub menu-sub-lg-down-accordion menu-sub-lg-dropdown px-lg-2 py-lg-4 w-lg-200px">
                {parentTab.children.map((childTab, childIndex) => (
                  <UISrefActive class="showing" key={childIndex}>
                    <UISref to={childTab.to} params={childTab.params}>
                      <a className="menu-item" data-kt-menu-trigger="click">
                        <span className="menu-link">
                          <span className="menu-title">{childTab.title}</span>
                        </span>
                      </a>
                    </UISref>
                  </UISrefActive>
                ))}
              </div>
            </a>
          </MenuLink>
        ) : parentTab.to ? (
          <MenuLink
            key={parentIndex}
            to={parentTab.to}
            params={parentTab.params}
          >
            <a className="menu-item text-nowrap" data-kt-menu-trigger="click">
              <span className="menu-link py-3">
                <span className="menu-title">{parentTab.title}</span>
              </span>
            </a>
          </MenuLink>
        ) : null,
      )}
    </>
  );
};
