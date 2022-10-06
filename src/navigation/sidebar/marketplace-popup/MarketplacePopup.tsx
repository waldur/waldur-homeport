import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Col, FormControl, Row } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAsync, useAsyncFn, useDebounce } from 'react-use';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import useOnScreen from '@waldur/core/useOnScreen';
import { truncate } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';
import { openSelectWorkspaceDialog } from '@waldur/navigation/workspace/actions';
import { getCustomer } from '@waldur/workspace/selectors';

import { getSidebarToggle } from '../Sidebar';

import { CategoriesPanel } from './CategoriesPanel';
import { OfferingsPanel } from './OfferingsPanel';
import { fetchCategories, fetchLastNOfferings, fetchOfferings } from './utils';
import { WelcomeView } from './WelcomeView';

import './MarketplacePopup.scss';

const RECENTLY_ADDED_OFFERINGS_UUID = 'recently_added_offerings_category';

export const MarketplacePopup: FunctionComponent = () => {
  const dispatch = useDispatch();

  const currentCustomer = useSelector(getCustomer);
  const [selectedCategory, selectCategory] = useState<Category>();

  const changeWorkspace = () => {
    dispatch(openSelectWorkspaceDialog());
  };

  const [filter, setFilter] = useState('');

  const refPopup = useRef<HTMLDivElement>();
  const refSearch = useRef<HTMLInputElement>();
  const isVisible = useOnScreen(refPopup);
  // Search input autofocus
  useEffect(() => {
    if (isVisible && refSearch.current) refSearch.current.focus();
  }, [isVisible, refSearch]);

  useEffect(() => {
    if (isVisible && refPopup.current) {
      refPopup.current.style.zIndex = '1055';
      refPopup.current.style.transform = 'translate(265px, 65px)';

      const control = getSidebarToggle();
      if (!control) {
        return;
      }

      if (document.body.hasAttribute('data-kt-aside-minimize')) {
        control.toggle();
      }
    }
  }, [isVisible]);

  const { value: lastOfferings } = useAsync(
    () => fetchLastNOfferings(currentCustomer),
    [currentCustomer],
  );

  const [
    {
      loading: loadingCategories,
      error: errorCategories,
      value: mainCategories,
    },
    loadCategories,
  ] = useAsyncFn<Category[]>(
    (search?: string) => fetchCategories(currentCustomer, search),
    [currentCustomer],
  );

  useEffect(() => {
    loadCategories();
  }, [currentCustomer]);

  const [
    { loading: loadingOfferings, value: offerings, error: errorOfferings },
    loadOfferings,
  ] = useAsyncFn(
    (category: Category, search: string) => {
      if (category && category.uuid === RECENTLY_ADDED_OFFERINGS_UUID) {
        return Promise.resolve(lastOfferings);
      }
      return fetchOfferings(currentCustomer, category, search);
    },
    [currentCustomer, lastOfferings],
  );

  const categories = useMemo(() => {
    if (lastOfferings && lastOfferings.length > 0) {
      const recentlyAddedOfferingsCategory: Category = {
        icon: undefined,
        offering_count: lastOfferings.length,
        title: translate('Recently added offerings'),
        uuid: RECENTLY_ADDED_OFFERINGS_UUID,
        url: undefined,
      };
      return [recentlyAddedOfferingsCategory].concat(mainCategories);
    }
    return mainCategories;
  }, [mainCategories, lastOfferings]);

  // search with delay
  useDebounce(
    () => {
      loadCategories(filter);
      loadOfferings(selectedCategory, filter);
    },
    500,
    [filter],
  );

  const selectCategoryAndLoadData = (category: Category) => {
    if (!category) return;
    selectCategory(category);
    loadOfferings(category, filter);
  };

  return (
    <>
      {isVisible &&
        ReactDOM.createPortal(
          <div className="fade modal-backdrop show" />,
          document.getElementById('kt_aside_toolbar'),
        )}
      <div
        id="marketplaces-selector"
        ref={refPopup}
        className="marketplaces-selector menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold rounded-0 pb-4 fs-6 h-100"
        data-kt-menu="true"
        data-popper-placement="end"
      >
        <div className="marketplaces-selector-header py-8 px-12">
          <Row>
            <Col xs={5} xl={3} className="text-white fs-7">
              <span className="text-nowrap">
                {translate('Showing services available for')}:{' '}
              </span>
              {currentCustomer && (
                <Tip
                  id="marketplaces-selector-customer-tip"
                  label={currentCustomer?.name}
                  className="d-block"
                >
                  <Button
                    variant="link"
                    className="btn-color-white btn-active-color-muted fs-7 fw-bolder text-nowrap p-0"
                    onClick={changeWorkspace}
                  >
                    {currentCustomer?.name
                      ? truncate(currentCustomer?.name, 15)
                      : currentCustomer?.abbreviation}{' '}
                    ({translate('change')})
                  </Button>
                </Tip>
              )}
            </Col>
            <Col xs={7} xl={6}>
              <div className="form-group">
                <FormControl
                  id="marketplaces-selector-search-box"
                  ref={refSearch}
                  type="text"
                  className="form-control-solid text-center bg-white"
                  autoFocus
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder={translate('Search offering...')}
                />
              </div>
            </Col>
          </Row>
        </div>
        <div className="d-flex h-100">
          {loadingCategories ? (
            <Col className="message-wrapper p-4">
              <LoadingSpinner />
            </Col>
          ) : errorCategories ? (
            <Col className="message-wrapper">
              <p className="text-center text-danger my-10 mx-4">
                {translate('Unable to load categories')}
              </p>
            </Col>
          ) : (
            <CategoriesPanel
              categories={categories}
              selectedCategory={selectedCategory}
              selectCategory={selectCategoryAndLoadData}
              filter={filter}
            />
          )}

          {!selectedCategory ? (
            <WelcomeView customer={currentCustomer} />
          ) : loadingOfferings ? (
            <Col className="message-wrapper p-4">
              <LoadingSpinner />
            </Col>
          ) : errorOfferings ? (
            <Col className="message-wrapper">
              <p className="text-center my-10 mx-4">
                <LoadingErred
                  loadData={() => selectCategoryAndLoadData(selectedCategory)}
                />
              </p>
            </Col>
          ) : (
            <OfferingsPanel
              offerings={offerings}
              customer={currentCustomer}
              category={selectedCategory}
            />
          )}
        </div>
      </div>
    </>
  );
};
