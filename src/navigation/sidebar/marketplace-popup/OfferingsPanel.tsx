import { CaretLeftIcon } from '@phosphor-icons/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRouter } from '@uirouter/react';
import classNames from 'classnames';
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { Tooltip } from 'waldur-ui';

import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { TextWithoutFormatting } from '@/core/TextWithoutFormatting';
import { truncate } from '@/core/utils';
import { translate } from '@/i18n';
import { getItemAbbreviation } from '@/navigation/workspace/context-selector/utils';

import { RECENTLY_ADDED_OFFERINGS_UUID } from './constants';
import { fetchOfferingsByPage, getSelectableRowProps } from './utils';

const VIRTUALIZED_SELECTOR_PAGE_SIZE = 20;

type ProviderOfferingResponse = Awaited<
  ReturnType<typeof fetchOfferingsByPage>
>['pageElements'];

const EmptyOfferingListPlaceholder: FunctionComponent = () => (
  <div className="flex items-center justify-center min-w-1/2 max-lg:w-full h-full text-secondary ellipsis">
    {translate('There are no offerings.')}
  </div>
);

const LoadingRow: FunctionComponent = () => (
  <div className="relative block py-4 px-6 text-center">
    <span className="text-quaternary">{translate('Fetching')}</span>
  </div>
);

const OfferingListItem: FunctionComponent<{
  item: ProviderOfferingResponse[0];
  onClick: (item: ProviderOfferingResponse[0]) => void;
  selectedItem?: ProviderOfferingResponse[0];
}> = ({ item, onClick, selectedItem }) => {
  const abbreviation = useMemo(() => getItemAbbreviation(item), [item]);
  const isPaused = item.state === 'Paused';
  const isSelected = selectedItem && item.uuid === selectedItem.uuid;

  return (
    <Tooltip label={isPaused ? item.paused_reason || item.state : undefined}>
      <span>
        <div
          data-uuid={item.uuid}
          // The waldur-integration-testing suite selects offerings by this
          // (docs/e2e-locators.md).
          data-testid="offering-item"
          className={classNames(
            'list-group-item relative block py-4 px-6 border-0 transition-colors',
            isPaused
              ? 'bg-secondary opacity-50 cursor-not-allowed'
              : isSelected
                ? 'cursor-pointer bg-tertiary'
                : 'cursor-pointer bg-primary hover:bg-secondary',
          )}
          {...getSelectableRowProps(() => onClick(item), isPaused)}
        >
          <div className="flex items-center self-stretch gap-2.5">
            {item.image ? (
              <div className="size-10 shrink-0 inline-flex items-center justify-center rounded-md overflow-hidden">
                <img
                  src={item.image}
                  alt="offering"
                  className="size-full object-contain"
                />
              </div>
            ) : (
              <ImagePlaceholder width="40px" height="40px">
                {abbreviation && (
                  <span className="text-sm font-medium">{abbreviation}</span>
                )}
              </ImagePlaceholder>
            )}
            {/* A flex child keeps its content width unless min-width is 0,
                which would stop `ellipsis` from truncating long text. */}
            <div className="min-w-0">
              <h5
                className={classNames(
                  'ellipsis mb-1',
                  isPaused ? 'text-quinary' : 'text-primary',
                )}
              >
                {item.name}
              </h5>
              <p className="ellipsis text-xs mb-0 text-quaternary">
                <TextWithoutFormatting html={truncate(item.description, 120)} />
              </p>
            </div>
          </div>
        </div>
      </span>
    </Tooltip>
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
  onSelect?: (offering: Offering) => void;
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
  const parentRef = useRef<HTMLDivElement>(null);

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
  // React state because we read it inside `loadPage` synchronously to dedupe.
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
        // to that length so virtualizer can compute holes against the
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

  // Reset pagination state when the dataset identity changes.
  const datasetKey = `${filter}-${customer?.uuid}-${project?.uuid}-${category?.uuid}`;
  useEffect(() => {
    inFlightPages.current = new Set();
    setItems([]);
    setItemCount(null);
    parentRef.current?.scrollTo({ top: 0 });
    void loadPage(0);
  }, [datasetKey, loadPage]);

  const count = itemCount ?? items.length;

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    const unrenderedPages = new Set<number>();
    for (const virtualItem of virtualItems) {
      if (!items[virtualItem.index]) {
        unrenderedPages.add(
          Math.floor(virtualItem.index / VIRTUALIZED_SELECTOR_PAGE_SIZE),
        );
      }
    }
    for (const page of unrenderedPages) {
      void loadPage(page);
    }
  }, [virtualItems, items, loadPage]);

  return (
    <div
      // The waldur-integration-testing suite scopes offerings by this
      // (docs/e2e-locators.md).
      data-testid="offering-listing"
      className="offering-listing w-full lg:w-1/2 lg:basis-1/2 flex flex-col h-full"
    >
      <button
        type="button"
        className="flex lg:hidden items-center gap-2 text-anchor font-medium p-1.5 ms-4 my-1.5 shrink-0"
        onClick={goBack}
      >
        <CaretLeftIcon size={14} weight="bold" />
        {translate('Go back to categories')}
      </button>
      <div className="block lg:hidden border-b border-secondary mx-6 shrink-0" />
      <h6 className="text-secondary font-medium mt-3 mb-1.5 ms-6 shrink-0">
        {translate('Offerings')}
      </h6>
      {itemCount === 0 ? (
        <EmptyOfferingListPlaceholder />
      ) : (
        <div
          ref={parentRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualItem) => {
              const item = items[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  {item ? (
                    <OfferingListItem
                      item={item}
                      selectedItem={selectedOffering}
                      onClick={handleOfferingClick}
                    />
                  ) : (
                    <LoadingRow />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
