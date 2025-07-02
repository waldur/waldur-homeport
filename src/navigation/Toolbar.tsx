import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FunctionComponent, useLayoutEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';

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
      <span className="svg-icon svg-icon-3">
        <CaretLeftIcon weight="bold" />
      </span>
    </Button>
    <Button
      variant="flush"
      size="sm"
      className="px-2 top-0 end-0 position-absolute h-100"
    >
      <span className="svg-icon svg-icon-3">
        <CaretRightIcon weight="bold" />
      </span>
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
          className="d-flex align-items-stretch overflow-auto"
        >
          <div ref={tabsWrapperRef} className="header-menu align-items-stretch">
            <div
              className="menu menu-column menu-row menu-rounded menu-gray-500 menu-state-bg-light-primary menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-state-arrow-primary fs-6 fw-bolder my-5 my-lg-0 align-items-stretch gap-2"
              data-kt-menu="true"
            >
              <TabsList />
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
