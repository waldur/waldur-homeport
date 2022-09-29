import { UISref, UISrefActive, useRouter } from '@uirouter/react';
import { FunctionComponent, useContext, useEffect, useState } from 'react';

import { LayoutContext } from './context';
import { getFilteredTabs } from './utils';

export const TabsList: FunctionComponent = () => {
  const ctx = useContext(LayoutContext);
  const router = useRouter();
  const [filteredTabs, setFilteredTabs] = useState(ctx.tabs || []);

  useEffect(() => {
    getFilteredTabs(ctx.tabs).then((tabs) => setFilteredTabs(tabs));
  }, [ctx.tabs, router]);

  return (
    <>
      {filteredTabs.map((parentTab, parentIndex) =>
        parentTab.to ? (
          <UISrefActive class="here" key={parentIndex}>
            <UISref to={parentTab.to} params={parentTab.params}>
              <a className="menu-item text-nowrap" data-kt-menu-trigger="click">
                <span className="menu-link py-3">
                  <span className="menu-title">{parentTab.title}</span>
                </span>
              </a>
            </UISref>
          </UISrefActive>
        ) : (
          <div
            key={parentIndex}
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
          </div>
        ),
      )}
    </>
  );
};
