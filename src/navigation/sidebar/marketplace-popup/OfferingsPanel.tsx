import { CaretLeft } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import classNames from 'classnames';
import {
  useState,
  useCallback,
  FunctionComponent,
  useMemo,
  forwardRef,
} from 'react';
import { ListGroupItem, Stack } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';
import { FixedSizeList as List } from 'react-window';
import paginate from 'react-window-paginated';

import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { TextWithoutFormatting } from '@waldur/core/TextWithoutFormatting';
import { Tip } from '@waldur/core/Tooltip';
import { truncate } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';

import { RECENTLY_ADDED_OFFERINGS_UUID } from './MarketplacePopup';
import { fetchOfferingsByPage } from './utils';

const PaginatedList = paginate(List);

const CustomScrollbars = ({ onScroll, forwardedRef, style, children }) => {
  const refSetter = useCallback(
    (scrollbarsRef) => {
      if (scrollbarsRef) {
        forwardedRef(scrollbarsRef.view);
      } else {
        forwardedRef(null);
      }
    },
    [forwardedRef],
  );

  return (
    <Scrollbars
      ref={refSetter}
      style={{ ...style, overflow: 'hidden' }}
      onScroll={onScroll}
      className="scrollbar-view"
    >
      {children}
    </Scrollbars>
  );
};

const CustomScrollbarsVirtualList = forwardRef((props: any, ref) => (
  <CustomScrollbars {...props} forwardedRef={ref} />
));

const VirtualPaginatedList: FunctionComponent<any> = (props) => (
  <PaginatedList {...props} outerElementType={CustomScrollbarsVirtualList} />
);

const VIRTUALIZED_SELECTOR_PAGE_SIZE = 20;

const EmptyOfferingListPlaceholder: FunctionComponent = () => (
  <div className="message-wrapper ellipsis">
    {translate('There are no offerings.')}
  </div>
);

const OfferingListItem: FunctionComponent<{
  data;
  style;
  item: Offering & { isFetching; isFailed };
  onClick;
  selectedItem: Offering;
}> = ({ item, onClick, selectedItem, style }) => {
  const abbreviation = useMemo(() => getItemAbbreviation(item), [item]);

  if (item.isFetching) {
    return (
      <ListGroupItem className="text-center" style={style}>
        <span className="text-muted">{translate('Fetching')}</span>
      </ListGroupItem>
    );
  }

  if (item.isFailed) {
    return (
      <ListGroupItem className="text-center" style={style}>
        <span className="text-muted">{translate('Failed')}</span>
      </ListGroupItem>
    );
  }

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
              <ImagePlaceholder
                width="40px"
                height="40px"
                backgroundColor="#e2e2e2"
              >
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

export const OfferingsPanel: FunctionComponent<{
  lastOfferings: Offering[];
  customer;
  project;
  category;
  filter;
  goBack;
  importable?: boolean;
  selectable?: boolean;
  onSelect?(offering: Offering): void;
}> = ({
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

  const handleOfferingClick = useCallback(
    (offering: Offering) => {
      selectOffering(offering);
      onSelect && onSelect(offering);
      if (!selectable) {
        router.stateService.go('marketplace-offering-public', {
          offering_uuid: offering.uuid,
        });
      }
    },
    [router, selectOffering, onSelect, selectable],
  );

  const getPage = (page) => {
    if (category && category.uuid === RECENTLY_ADDED_OFFERINGS_UUID) {
      return Promise.resolve({
        pageElements: lastOfferings,
        itemCount: lastOfferings.length,
      });
    } else if (!category) {
      return Promise.resolve({
        pageElements: [],
        itemCount: 0,
      });
    }
    return fetchOfferingsByPage(
      customer,
      project,
      category,
      filter,
      page + 1,
      VIRTUALIZED_SELECTOR_PAGE_SIZE,
      importable,
    );
  };

  return (
    <div className="offering-listing">
      <button
        type="button"
        className="btn-back text-anchor fw-bold p-2 ms-5 my-2"
        onClick={goBack}
      >
        <CaretLeft size={14} weight="bold" />
        {translate('Go back to categories')}
      </button>
      <div className="divider border-bottom mx-7" />
      <h6 className="text-gray-700 fw-bold mt-4 mb-2 ms-7">
        {translate('Offerings')}
      </h6>
      <VirtualPaginatedList
        height={500}
        itemSize={68}
        getPage={getPage}
        key={`${filter}-${customer?.uuid}-${project?.uuid}-${category?.uuid}`}
        elementsPerPage={VIRTUALIZED_SELECTOR_PAGE_SIZE}
        noResultsRenderer={EmptyOfferingListPlaceholder}
      >
        {(listItemProps) => {
          const item = listItemProps.data[listItemProps.index];
          return (
            <OfferingListItem
              {...listItemProps}
              item={item}
              selectedItem={selectedOffering}
              onClick={handleOfferingClick}
            />
          );
        }}
      </VirtualPaginatedList>
    </div>
  );
};
