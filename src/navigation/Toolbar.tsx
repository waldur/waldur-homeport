import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { debounce } from 'es-toolkit';
import {
  FunctionComponent,
  MutableRefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';

import { TabsList } from './TabsList';

interface OwnProps {
  /**
   * The element page actions render into (LayoutSlot `actions`), given only
   * while a page fills the slot.
   */
  actionsRef?: (element: HTMLDivElement | null) => void;
}

/**
 * Scrolls the tab row by most of its visible width. The arrows are named
 * buttons so a pointer, a keyboard or a screen reader can use them; a
 * keyboard user can also just Tab through the links, which the browser
 * scrolls into view. They sit at the ends of the tab row (its wrapper is
 * their containing block), over the padding the row keeps free for them.
 */
const TabsScrollArrows: FunctionComponent<{
  scrollRef: MutableRefObject<HTMLDivElement>;
}> = ({ scrollRef }) => {
  const scrollBy = (direction: -1 | 1) => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollBy({
      left: direction * Math.max(node.clientWidth * 0.8, 100),
      behavior: 'smooth',
    });
  };
  return (
    <>
      <BaseButton
        variant="tertiary-ghost"
        size="sm"
        className="absolute inset-y-0 start-0 z-1 h-full bg-primary"
        iconNode={<CaretLeftIcon weight="bold" />}
        aria-label={translate('Scroll tabs left')}
        onClick={() => scrollBy(-1)}
      />
      <BaseButton
        variant="tertiary-ghost"
        size="sm"
        className="absolute inset-y-0 end-0 z-1 h-full bg-primary"
        iconNode={<CaretRightIcon weight="bold" />}
        aria-label={translate('Scroll tabs right')}
        onClick={() => scrollBy(1)}
      />
    </>
  );
};

export const Toolbar: FunctionComponent<OwnProps> = ({ actionsRef }) => {
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
    <div
      // The waldur-integration-testing suite selects the page tabs by this
      // (docs/e2e-locators.md).
      data-testid="page-toolbar"
      className="flex items-center h-[55px] lg:h-[60px] bg-primary border-y-[1px] border-y-secondary"
    >
      <div
        className={classNames(
          PAGE_CONTAINER_CLASSNAME,
          'flex items-center justify-between',
        )}
      >
        {/* The tabs take the room the actions leave and scroll inside it,
            without a scrollbar: the arrows (or a Tab, a swipe, a wheel)
            scroll them. */}
        <div className="relative flex min-w-0 flex-1 self-stretch">
          {showScrollArrows && <TabsScrollArrows scrollRef={tabsScrollRef} />}
          <div
            ref={tabsScrollRef}
            className={classNames(
              'flex min-w-0 flex-1 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              showScrollArrows && 'px-[32px]',
            )}
          >
            <nav ref={tabsWrapperRef} aria-label={translate('Page tabs')}>
              <ul className="m-0 flex w-full list-none items-stretch gap-[8px] p-0 text-sm font-semibold">
                <TabsList />
              </ul>
            </nav>
          </div>
        </div>
        {actionsRef && (
          <div
            ref={actionsRef}
            className="flex shrink-0 items-center gap-[0.5rem] lg:gap-[0.75rem] ps-[0.75rem]"
          />
        )}
      </div>
    </div>
  );
};
