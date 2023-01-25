import { UISref } from '@uirouter/react';
import classNames from 'classnames';
import { groupBy, isEmpty } from 'lodash';
import { Fragment, useEffect, useState, useRef } from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { get } from '@waldur/core/api';
import { InlineSVG } from '@waldur/core/svg/InlineSVG';
import { translate } from '@waldur/i18n';

import { SearchFilters } from './SearchFilters';

const iconEmpty = require('./file-search.svg');

const SearchIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      opacity="0.5"
      x="17.0365"
      y="15.1223"
      width="8.15546"
      height="2"
      rx="1"
      transform="rotate(45 17.0365 15.1223)"
      fill="currentColor"
    ></rect>
    <path
      d="M11 19C6.55556 19 3 15.4444 3 11C3 6.55556 6.55556 3 11 3C15.4444 3 19 6.55556 19 11C19 15.4444 15.4444 19 11 19ZM11 5C7.53333 5 5 7.53333 5 11C5 14.4667 7.53333 17 11 17C14.4667 17 17 14.4667 17 11C17 7.53333 14.4667 5 11 5Z"
      fill="currentColor"
    ></path>
  </svg>
);

const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      opacity="0.5"
      x="6"
      y="17.3137"
      width="16"
      height="2"
      rx="1"
      transform="rotate(-45 6 17.3137)"
      fill="currentColor"
    ></rect>
    <rect
      x="7.41422"
      y="6"
      width="16"
      height="2"
      rx="1"
      transform="rotate(45 7.41422 6)"
      fill="currentColor"
    ></rect>
  </svg>
);

const useSearch = () => {
  const [query, setQuery] = useState('');
  const form: any = useSelector(getFormValues('globalSearchFilters'));

  const params = {
    query: query || form?.query,
    offering_uuid: form?.offering?.uuid,
    category_uuid: form?.category?.uuid,
    state: form?.state?.value || [
      'Creating',
      'OK',
      'Erred',
      'Updating',
      'Terminating',
    ],
  };

  const result = useQuery(
    [`global-search`, query],
    async ({ signal }) =>
      await get<any[]>('/marketplace-resources/', {
        signal,
        params: {
          ...params,
          field: [
            'name',
            'uuid',
            'category_title',
            'offering_thumbnail',
            'customer_name',
            'project_name',
            'project_uuid',
            'state',
          ],
        },
      }).then((response) => groupBy(response.data, 'category_title')),
  );
  return { query, setQuery, result };
};

const SearchItem = ({ item }) => (
  <UISref
    to="marketplace-project-resource-details"
    params={{ uuid: item.project_uuid, resource_uuid: item.uuid }}
  >
    <a className="d-flex text-dark text-hover-primary align-items-center mb-5 mw-300px mw-md-350px">
      <div className="symbol symbol-40px me-4">
        <img src={item.offering_thumbnail} />
      </div>
      <div className="d-flex flex-column justify-content-start fw-semibold">
        <span className="fs-6 fw-semibold">{item.name}</span>
        <span className="fs-7 fw-semibold text-muted">
          {item.customer_name} / {item.project_name}
        </span>
      </div>
    </a>
  </UISref>
);

const SearchPopover = () => {
  const [menuState, setMenuState] = useState<'main' | 'advanced'>('main');
  const { query, setQuery, result } = useSearch();

  const refSearch = useRef<HTMLInputElement>();
  useEffect(() => {
    if (refSearch.current) {
      refSearch.current.focus();
    }
  }, []);

  const doSearch = () => {
    setMenuState('main');
    result.refetch();
  };

  return (
    <div className="menu menu-sub menu-sub-dropdown p-7 show">
      <div className={`${menuState === 'main' ? '' : 'd-none'}`}>
        <form className="w-100 position-relative mb-3" auto-complete="off">
          <span className="svg-icon svg-icon-2 svg-icon-lg-1 svg-icon-gray-500 position-absolute top-50 translate-middle-y ms-0">
            <SearchIcon />
          </span>
          <input
            ref={refSearch}
            type="text"
            className="search-input form-control form-control-flush ps-10"
            name="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={translate('Search...')}
          />
          <span
            className={classNames(
              'position-absolute top-50 end-0 translate-middle-y lh-0 me-1',
              result.status === 'loading' ? '' : 'd-none',
            )}
          >
            <span className="spinner-border h-15px w-15px align-middle text-gray-400"></span>
          </span>
          <span
            className={classNames(
              'btn btn-flush btn-active-color-primary position-absolute top-50 end-0 translate-middle-y lh-0',
              result.status === 'success' && query ? '' : 'd-none',
            )}
            onClick={() => setQuery('')}
          >
            <span className="svg-icon svg-icon-2 svg-icon-lg-1 me-0">
              <CloseIcon />
            </span>
          </span>

          <div
            className={classNames(
              'position-absolute top-50 end-0 translate-middle-y',
              result.status === 'success' && !query ? '' : 'd-none',
            )}
            data-kt-search-element="toolbar"
          >
            <div
              data-kt-search-element="advanced-options-form-show"
              className="btn btn-icon w-20px btn-sm btn-active-color-primary"
              data-bs-toggle="tooltip"
              onClick={() => {
                setMenuState('advanced');
              }}
              title="Show more search options"
            >
              <i className="fa fa-chevron-down"></i>
            </div>
          </div>
        </form>
        <div className="separator border-gray-200 mb-6"></div>
        <div>
          <div className="scroll-y mh-200px mh-lg-350px">
            {result.data
              ? Object.keys(result.data).map((item, categoryIndex) => (
                  <Fragment key={categoryIndex}>
                    <h3 className="fs-5 text-muted m-0 pb-5">{item}</h3>
                    {result.data[item].map((item, resourceIndex) => (
                      <SearchItem item={item} key={resourceIndex} />
                    ))}
                  </Fragment>
                ))
              : null}
          </div>
          <div
            className={classNames('text-center', {
              'd-none': !isEmpty(result.data) || result.status === 'loading',
            })}
          >
            <div className="pt-10 pb-10">
              <InlineSVG path={iconEmpty} className="svg-icon-4x opacity-50" />
            </div>

            <div className="pb-15 fw-bold">
              <h3 className="text-gray-600 fs-5 mb-2">
                {translate('No result found')}
              </h3>
              <div className="text-muted fs-7">
                {translate('Please try again with a different query')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <form className={`pt-1 ${menuState === 'advanced' ? '' : 'd-none'}`}>
        <h3 className="fw-bold text-dark mb-7">
          {translate('Advanced Search')}
        </h3>

        <SearchFilters />

        <div className="d-flex justify-content-end">
          <Button
            variant="light"
            size="sm"
            onClick={() => {
              setMenuState('main');
            }}
            className="fw-bolder btn-active-light-primary me-2"
          >
            {translate('Cancel')}
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="fw-bolder"
            onClick={doSearch}
          >
            {translate('Search')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const SearchToggle = () => (
  <OverlayTrigger
    trigger="click"
    placement="bottom-end"
    overlay={
      <Popover
        id="GlobalSearch"
        className="mw-350px mw-md-400px w-350px w-md-400px"
      >
        <SearchPopover />{' '}
      </Popover>
    }
    rootClose={true}
  >
    <div
      className="d-flex align-items-center ms-1 ms-lg-3"
      id="searchIconContainer"
    >
      <div className="btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px">
        <span className="svg-icon svg-icon-1">
          <SearchIcon />
        </span>
      </div>
    </div>
  </OverlayTrigger>
);
