import { UISref, UISrefActive } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { useTabs } from './useTabs';

export const TabsList: FunctionComponent = () => {
  const tabs = useTabs();

  return (
    <>
      {tabs.map((parentTab, parentIndex) =>
        parentTab.children?.length > 0 ? (
          <UISrefActive class="here" key={parentIndex}>
            <UISref to={parentTab.to}>
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
            </UISref>
          </UISrefActive>
        ) : parentTab.to ? (
          <UISrefActive class="here" key={parentIndex}>
            <UISref to={parentTab.to} params={parentTab.params}>
              <a className="menu-item text-nowrap" data-kt-menu-trigger="click">
                <span className="menu-link py-3">
                  <span className="menu-title">{parentTab.title}</span>
                </span>
              </a>
            </UISref>
          </UISrefActive>
        ) : null,
      )}
    </>
  );
};
