import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { debounce } from 'lodash-es';
import {
  FunctionComponent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

import { TabsList } from './TabsList';

interface OwnProps {
  actions?: React.ReactNode;
}

const TabsScrollArrows: FunctionComponent = () => (
  <>
    <BaseButton
      variant="tertiary-ghost"
      size="sm"
      className="px-2 top-0 start-0 position-absolute h-100"
      iconNode={<CaretLeftIcon weight="bold" />}
    />
    <BaseButton
      variant="tertiary-ghost"
      size="sm"
      className="px-2 top-0 end-0 position-absolute h-100"
      iconNode={<CaretRightIcon weight="bold" />}
    />
  </>
);

export const Toolbar: FunctionComponent<OwnProps> = ({ actions }) => {
  const tabsScrollRef = useRef<HTMLDivElement>();
  const tabsWrapperRef = useRef<HTMLElement>();
  const [showScrollArrows, setShowScrollArrows] = useState(false);

  const updateSize = useCallback(
    debounce(() => {
      if (!tabsWrapperRef.current || !tabsScrollRef.current) return;
      setShowScrollArrows(
        tabsWrapperRef.current.clientWidth > tabsScrollRef.current.clientWidth,
      );
    }, 250),
    [tabsScrollRef.current, tabsWrapperRef.current],
  );

  useLayoutEffect(() => {
    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, [
    updateSize,
    /* watch wrapper width to check arrows, on page loaded */
    tabsWrapperRef.current?.clientWidth,
  ]);

  return (
    <div className="toolbar">
      <div className="container-fluid d-flex flex-stack">
        {showScrollArrows && <TabsScrollArrows />}
        <div
          ref={tabsScrollRef}
          className="d-flex align-items-stretch overflow-auto"
        >
          <nav ref={tabsWrapperRef} aria-label={translate('Page tabs')}>
            <ul className="m-0 flex w-full list-none items-stretch gap-[8px] p-0 fs-6 fw-bolder my-5 my-lg-0">
              <TabsList />
            </ul>
          </nav>
        </div>
        <div className="d-flex align-items-center gap-2 gap-lg-3">
          {actions}
        </div>
      </div>
    </div>
  );
};
