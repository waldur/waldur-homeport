import { UISref, UISrefActive } from '@uirouter/react';
import React, {
  FunctionComponent,
  useMemo,
  useState,
  useContext,
  useLayoutEffect,
  useRef,
} from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import WarningBar from '@waldur/auth/WarningBar';
import { MasterLayout } from '@waldur/metronic/layout/MasterLayout';
import { getUser } from '@waldur/workspace/selectors';

import { AppFooter } from './AppFooter';
import { LayoutContext, LayoutContextInterface } from './context';
import { CookiesConsent } from './cookies/CookiesConsent';
import { AppHeader } from './header/AppHeader';
import { ExternalLinks } from './header/ExternalLinks';
import { UnifiedSidebar } from './sidebar/UnifiedSidebar';
import { QuickProjectSelectorToggle } from './workspace/quick-project-selector/QuickProjectSelectorToggle';

const TabsList: FunctionComponent = () => {
  const ctx = useContext(LayoutContext);
  return (
    <>
      {(ctx.tabs || []).map((tab, index) => (
        <UISrefActive class="here" key={index}>
          <UISref to={tab.to}>
            <a className="menu-item text-nowrap" data-kt-menu-trigger="click">
              <span className="menu-link py-3">
                <span className="menu-title">{tab.title}</span>
              </span>
            </a>
          </UISref>
        </UISrefActive>
      ))}
    </>
  );
};

const TabsScrollArrows: FunctionComponent = () => (
  <>
    <Button
      variant="flush"
      size="sm"
      className="px-2 top-0 start-0 position-absolute h-100"
    >
      <i className="fa fa-chevron-left" />
    </Button>
    <Button
      variant="flush"
      size="sm"
      className="px-2 top-0 end-0 position-absolute h-100"
    >
      <i className="fa fa-chevron-right" />
    </Button>
  </>
);

export const Layout: React.FC = ({ children }) => {
  const currentUser = useSelector(getUser);
  const [actions, setActions] = useState(null);
  const [tabs, setTabs] = useState(null);
  const [sidebarKey, setSidebarKey] = useState('');
  const context = useMemo<Partial<LayoutContextInterface>>(
    () => ({ setActions, sidebarKey, setSidebarKey, tabs, setTabs }),
    [setActions, sidebarKey, setSidebarKey, tabs, setTabs],
  );

  const tabsScrollRef = useRef<HTMLDivElement>();
  const tabsWrapperRef = useRef<HTMLDivElement>();
  const [showScrollArrows, setShowScrollArrows] = useState(false);
  useLayoutEffect(() => {
    function updateSize() {
      setShowScrollArrows(
        tabsWrapperRef.current.clientWidth > tabsScrollRef.current.clientWidth,
      );
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, [tabsScrollRef.current, tabsWrapperRef.current]);

  if (!currentUser) {
    return null;
  }
  return (
    <LayoutContext.Provider value={context}>
      <div className="d-flex flex-column flex-root">
        <div className="page d-flex flex-row flex-column-fluid">
          <UnifiedSidebar />
          <div className="wrapper d-flex flex-column flex-row-fluid">
            <CookiesConsent />
            <AppHeader />
            <WarningBar />
            <div className="content d-flex flex-column flex-column-fluid">
              <div className="toolbar">
                <div className="container-fluid d-flex flex-stack">
                  {showScrollArrows && <TabsScrollArrows />}
                  <div
                    ref={tabsScrollRef}
                    className="d-flex align-items-stretch scroll-x"
                  >
                    <div
                      ref={tabsWrapperRef}
                      className="header-menu align-items-stretch"
                    >
                      <div className="menu menu-rounded menu-column menu-row menu-state-bg menu-title-gray-700 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-400 fw-bold my-5 my-lg-0 align-items-stretch">
                        <QuickProjectSelectorToggle />
                        <TabsList />
                        <ExternalLinks />
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2 gap-lg-3">
                    {actions}
                  </div>
                </div>
              </div>
              <div className="post d-flex flex-column-fluid">
                <div className="container-xxl">
                  {children}
                  <MasterLayout />
                </div>
              </div>
            </div>
            <AppFooter />
          </div>
        </div>
      </div>
    </LayoutContext.Provider>
  );
};
