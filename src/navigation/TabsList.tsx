import { UISref, UISrefActive } from '@uirouter/react';
import { FunctionComponent, useContext } from 'react';

import { LayoutContext } from './context';

export const TabsList: FunctionComponent = () => {
  const ctx = useContext(LayoutContext);
  return (
    <>
      {(ctx.tabs || []).map((parentTab, parentIndex) =>
        parentTab.to ? (
          <UISrefActive class="here" key={parentIndex}>
            <UISref to={parentTab.to}>
              <a className="menu-item text-nowrap" data-kt-menu-trigger="click">
                <span className="menu-link py-3">
                  <span className="menu-title">{parentTab.title}</span>
                </span>
              </a>
            </UISref>
          </UISrefActive>
        ) : (
          <div
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
                  <UISref to={childTab.to}>
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
