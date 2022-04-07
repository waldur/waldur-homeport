import { UISref, UISrefActive } from '@uirouter/react';
import { useContext, FunctionComponent } from 'react';

import 'world-flags-sprite/stylesheets/flags16.css';
import { LayoutContext } from '../context';

import { ExternalLinks } from './ExternalLinks';
import { UserDropdownMenu } from './UserDropdown';

const TabsList: FunctionComponent = () => {
  const ctx = useContext(LayoutContext);
  return (
    <>
      {(ctx.tabs || []).map((tab, index) => (
        <UISrefActive class="here" key={index}>
          <div className="menu-item">
            <span className="menu-link py-3">
              <UISref to={tab.to}>
                <a className="menu-title">{tab.title}</a>
              </UISref>
            </span>
          </div>
        </UISrefActive>
      ))}
    </>
  );
};

export const AppHeader: FunctionComponent = () => {
  return (
    <div className="header align-items-stretch">
      <div className="container-fluid d-flex align-items-stretch justify-content-between">
        <div className="d-flex align-items-stretch justify-content-between flex-lg-grow-1">
          <div className="d-flex align-items-stretch">
            <div className="header-menu align-items-stretch">
              <div className="menu menu-lg-rounded menu-column menu-lg-row menu-state-bg menu-title-gray-700 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-400 fw-bold my-5 my-lg-0 align-items-stretch">
                <TabsList />
                <ExternalLinks />
              </div>
            </div>
          </div>
          <div className="d-flex align-items-stretch flex-shrink-0">
            <div className="d-flex align-items-center ms-1 ms-lg-3">
              <UserDropdownMenu />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
