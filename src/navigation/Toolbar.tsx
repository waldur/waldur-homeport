import { FunctionComponent, useState, useLayoutEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';

import { ExternalLinks } from './header/ExternalLinks';
import { TabsList } from './TabsList';

interface OwnProps {
  actions?: React.ReactNode;
}

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

export const Toolbar: FunctionComponent<OwnProps> = ({ actions }) => {
  const tabsScrollRef = useRef<HTMLDivElement>();
  const tabsWrapperRef = useRef<HTMLDivElement>();
  const [showScrollArrows, setShowScrollArrows] = useState(false);
  useLayoutEffect(() => {
    function updateSize() {
      if (!tabsWrapperRef.current || !tabsScrollRef.current) return;
      setShowScrollArrows(
        tabsWrapperRef.current.clientWidth > tabsScrollRef.current.clientWidth,
      );
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, [tabsScrollRef.current, tabsWrapperRef.current]);

  return (
    <div className="toolbar">
      <div className="container-fluid d-flex flex-stack">
        {showScrollArrows && <TabsScrollArrows />}
        <div
          ref={tabsScrollRef}
          className="d-flex align-items-stretch scroll-x"
        >
          <div ref={tabsWrapperRef} className="header-menu align-items-stretch">
            <div
              className="menu menu-column menu-row menu-rounded menu-gray-700 menu-here-bg-light menu-state-title-dark menu-state-icon-dark menu-state-bullet-dark menu-state-arrow-dark fw-bold my-5 my-lg-0 align-items-stretch"
              data-kt-menu="true"
            >
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
  );
};
