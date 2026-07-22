import { CaretLeftIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import classNames from 'classnames';
import {
  CSSProperties,
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ListGroupItem, Stack } from 'react-bootstrap';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { TextWithoutFormatting } from '@/core/TextWithoutFormatting';
import { Tip } from '@/core/Tooltip';
import { truncate } from '@/core/utils';
import { translate } from '@/i18n';
import { getItemAbbreviation } from '@/navigation/workspace/context-selector/utils';

import { RECENTLY_ADDED_OFFERINGS_UUID } from './constants';
import { fetchOfferingsByPage } from './utils';

const VIRTUALIZED_SELECTOR_PAGE_SIZE = 20;
// Fallback height (px) used until the viewport is measured. Matches the
// `max-height` of `.offering-listing-viewport` so the first paint never
// over-renders. The real height is measured at runtime (see below) because
// the pane height is responsive (`calc(100vh - 270px)`, clamped) and
// react-window needs the actual pixel height to virtualize and scroll
// correctly — a hardcoded value disagreed with the CSS-clamped box.
const FALLBACK_LIST_HEIGHT = 320;
const ITEM_SIZE = 68;

type ProviderOfferingResponse = Awaited<
  ReturnType<typeof fetchOfferingsByPage>
>['pageElements'];

const EmptyOfferingListPlaceholder: FunctionComponent = () => (
  <div className="message-wrapper ellipsis">
    {translate('There are no offerings.')}
  </div>
);

const LoadingRow: FunctionComponent<{ style: CSSProperties }> = ({ style }) => (
  <ListGroupItem className="text-center" style={style}>
    <span className="text-muted">{translate('Fetching')}</span>
  </ListGroupItem>
);

const OfferingListItem: FunctionComponent<{
  style: CSSProperties;
  item: ProviderOfferingResponse[0];
  onClick: (item: ProviderOfferingResponse[0]) => void;
  selectedItem?: ProviderOfferingResponse[0];
}> = ({ item, onClick, selectedItem, style }) => {
  const abbreviation = useMemo(() => getItemAbbreviation(item), [item]);

  return (
    <Tip
      label={
        item.state === 'Paused' ? item.paused_reason || item.state : undefined
      }
      id={`tip-${item.uuid}`}
      data-kt-menu-dismiss="true"
    >
      <ListGroupItem
        data-uuid={item.uuid}
        className={classNames({
          active: selectedItem && item.uuid === selectedItem.uuid,
        })}
        style={style}
        onClick={() => onClick(item)}
        disabled={item.state === 'Paused'}
      >
        <Stack direction="horizontal" gap={3}>
          {item.image ? (
            <div className="symbol symbol-40px">
              <img src={item.image} alt="offering" />
            </div>
          ) : (
            <div className="symbol">
              <ImagePlaceholder width="40px" height="40px">
                {abbreviation && (
                  <div className="symbol-label fs-6 fw-bold">
                    {abbreviation}
                  </div>
                )}
              </ImagePlaceholder>
            </div>
          )}
          <div>
            <h5 className="title ellipsis mb-1">{truncate(item.name, 40)}</h5>
            <p className="description ellipsis fs-7 mb-0">
              <TextWithoutFormatting html={truncate(item.description, 120)} />
            </p>
          </div>
        </Stack>
      </ListGroupItem>
    </Tip>
  );
};

interface OfferingsPanelProps {
  lastOfferings: ProviderOfferingResponse;
  customer;
  project;
  category;
  filter;
  goBack;
  importable?: boolean;
  selectable?: boolean;
  onSelect?(offering: Offering): void;
}

export const OfferingsPanel: FunctionComponent<OfferingsPanelProps> = ({
  lastOfferings,
  customer,
  project,
  category,
  filter,
  goBack,
  importable,
  selectable,
  onSelect,
}) => {
  const [selectedOffering, selectOffering] = useState<Offering>();
  const router = useRouter();

  // Measure the scroll viewport so react-window's `height` matches the actual
  // CSS-clamped box (`.offering-listing-viewport`). A callback ref keeps the
  // ResizeObserver in sync as the node mounts/unmounts and the viewport
  // resizes (responsive height + window resize).
  const [listHeight, setListHeight] = useState(FALLBACK_LIST_HEIGHT);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const viewportRef = useCallback((node: HTMLDivElement | null) => {
    resizeObserverRef.current?.disconnect();
    if (node && typeof ResizeObserver !== 'undefined') {
      const measure = () =>
        setListHeight(node.clientHeight || FALLBACK_LIST_HEIGHT);
      measure();
      resizeObserverRef.current = new ResizeObserver(measure);
      resizeObserverRef.current.observe(node);
    }
  }, []);

  const handleOfferingClick = useCallback(
    (offering: Offering) => {
      selectOffering(offering);
      if (onSelect) onSelect(offering);
      if (!selectable) {
        router.stateService.go('marketplace-offering-public', {
          offering_uuid: offering.uuid,
        });
      }
    },
    [router, onSelect, selectable],
  );

  // Pagination state. `items` is sparse — entries land as their parent page
  // resolves. `itemCount === null` until the first page request returns
  // (lets us delay the "no offerings" empty-state decision until we know).
  const [items, setItems] = useState<Array<ProviderOfferingResponse[number]>>(
    [],
  );
  const [itemCount, setItemCount] = useState<number | null>(null);
  // Pages that are currently fetching OR already settled. Tracked outside
  // React state because we read it inside `loadMoreItems` synchronously to
  // dedupe overlapping calls — InfiniteLoader can call us multiple times
  // for the same range before the first promise resolves.
  const inFlightPages = useRef<Set<number>>(new Set());

  const fetchPage = useCallback(
    async (pageIndex: number) => {
      if (category && category.uuid === RECENTLY_ADDED_OFFERINGS_UUID) {
        return {
          pageElements: lastOfferings,
          itemCount: lastOfferings.length,
        };
      }
      if (!category) {
        return { pageElements: [], itemCount: 0 };
      }
      const page = await fetchOfferingsByPage(
        customer,
        project,
        category,
        filter,
        pageIndex + 1,
        VIRTUALIZED_SELECTOR_PAGE_SIZE,
        importable,
      );
      return {
        pageElements: page.pageElements,
        itemCount: page.itemCount,
      };
    },
    [category, customer, project, filter, importable, lastOfferings],
  );

  const loadPage = useCallback(
    async (pageIndex: number) => {
      if (inFlightPages.current.has(pageIndex)) return;
      inFlightPages.current.add(pageIndex);
      const { pageElements, itemCount: total } = await fetchPage(pageIndex);
      setItemCount(total);
      setItems((prev) => {
        // The first page tells us how many total items exist; grow `items`
        // to that length so InfiniteLoader can compute holes against the
        // real size, not just what we've loaded so far.
        const next =
          prev.length < total
            ? prev.concat(new Array(total - prev.length))
            : prev.slice();
        const base = pageIndex * VIRTUALIZED_SELECTOR_PAGE_SIZE;
        for (let i = 0; i < pageElements.length; i++) {
          next[base + i] = pageElements[i];
        }
        return next;
      });
    },
    [fetchPage],
  );

  // Reset pagination state when the dataset identity changes. This replaces
  // the old `key=...` remount trick — using state reset keeps the wrapper
  // mounted (so scroll position resets cleanly via FixedSizeList's own
  // mechanics rather than via remount).
  const datasetKey = `${filter}-${customer?.uuid}-${project?.uuid}-${category?.uuid}`;
  useEffect(() => {
    inFlightPages.current = new Set();
    setItems([]);
    setItemCount(null);
    // Kick off the first page eagerly — InfiniteLoader only fires
    // loadMoreItems on scroll, which would otherwise leave the list empty
    // on initial render.
    void loadPage(0);
  }, [datasetKey, loadPage]);

  const isItemLoaded = useCallback(
    (index: number) => items[index] !== undefined,
    [items],
  );

  const loadMoreItems = useCallback(
    (startIndex: number, stopIndex: number) => {
      const pages = new Set<number>();
      for (let i = startIndex; i <= stopIndex; i++) {
        pages.add(Math.floor(i / VIRTUALIZED_SELECTOR_PAGE_SIZE));
      }
      return Promise.all([...pages].map((p) => loadPage(p))).then(
        () => undefined,
      );
    },
    [loadPage],
  );

  const rowRenderer = useCallback(
    ({ index, style }: { index: number; style: CSSProperties }) => {
      const item = items[index];
      if (!item) return <LoadingRow style={style} />;
      return (
        <OfferingListItem
          style={style}
          item={item}
          selectedItem={selectedOffering}
          onClick={handleOfferingClick}
        />
      );
    },
    [items, selectedOffering, handleOfferingClick],
  );

  return (
    <div className="offering-listing">
      <button
        type="button"
        className="btn-back text-anchor fw-bold p-2 ms-5 my-2"
        onClick={goBack}
      >
        <CaretLeftIcon size={14} weight="bold" />
        {translate('Go back to categories')}
      </button>
      <div className="divider border-bottom mx-7" />
      <h6 className="text-gray-700 fw-bold mt-4 mb-2 ms-7">
        {translate('Offerings')}
      </h6>
      {itemCount === 0 ? (
        <EmptyOfferingListPlaceholder />
      ) : (
        <div className="offering-listing-viewport" ref={viewportRef}>
          {/* @ts-ignore */}
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount ?? VIRTUALIZED_SELECTOR_PAGE_SIZE}
            loadMoreItems={loadMoreItems}
            minimumBatchSize={VIRTUALIZED_SELECTOR_PAGE_SIZE}
          >
            {({ onItemsRendered, ref }) => (
              // @ts-ignore
              <List
                ref={ref}
                onItemsRendered={onItemsRendered}
                height={listHeight}
                itemSize={ITEM_SIZE}
                itemCount={itemCount ?? VIRTUALIZED_SELECTOR_PAGE_SIZE}
                width="100%"
                className="scrollbar-view"
              >
                {rowRenderer}
              </List>
            )}
          </InfiniteLoader>
        </div>
      )}
    </div>
  );
};
