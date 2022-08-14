import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { MasterLayout } from '@waldur/metronic/layout/MasterLayout';
import { AppFooter } from '@waldur/navigation/AppFooter';
import { SiteHeader } from '@waldur/navigation/header/SiteHeader';
import { wrapTooltip } from '@waldur/table/ActionButton';

import { LayoutContext, LayoutContextInterface } from './context';
import { CookiesConsent } from './cookies/CookiesConsent';
import { TabsList } from './Layout';
import { SiteSidebar } from './sidebar/SiteSidebar';

export const AnonymousLayout: FunctionComponent = () => {
  const { state } = useCurrentStateAndParams();
  const [tabs, setTabs] = useState(null);
  const context = useMemo<Partial<LayoutContextInterface>>(
    () => ({ tabs, setTabs }),
    [tabs, setTabs],
  );

  return (
    <LayoutContext.Provider value={context}>
      <div className="page d-flex flex-row flex-column-fluid">
        <SiteSidebar />
        <div className="wrapper d-flex flex-column flex-row-fluid">
          <CookiesConsent />
          {!state.data?.hideHeader && <SiteHeader />}
          <div className="content d-flex flex-column">
            <div className="toolbar">
              <div className="container-fluid d-flex flex-stack">
                <div className="d-flex align-items-stretch scroll-x">
                  <div className="header-menu align-items-stretch">
                    <div className="menu menu-rounded menu-column menu-row menu-state-bg menu-title-gray-700 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-400 fw-bold my-5 my-lg-0 align-items-stretch">
                      {wrapTooltip(
                        translate('Please login to select a project'),
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-nowrap min-w-125px me-4"
                          data-cy="quick-project-selector-toggle"
                        >
                          N/A
                          <span className="svg-icon svg-icon-1 pull-right">
                            <i className="fa fa-caret-down lh-base" />
                          </span>
                        </Button>,
                        { placement: 'bottom' },
                      )}
                      <TabsList />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="post d-flex flex-column-fluid">
              <div className="container-xxl">
                <MasterLayout />
              </div>
            </div>
          </div>
          <AppFooter />
        </div>
      </div>
    </LayoutContext.Provider>
  );
};
