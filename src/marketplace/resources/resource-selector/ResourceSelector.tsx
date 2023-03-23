import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import { get } from '@waldur/core/api';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { Link } from '@waldur/core/Link';
import { SearchIcon } from '@waldur/core/svg/SearchIcon';
import useOnScreen from '@waldur/core/useOnScreen';
import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/assets/ts/components';

import { Resource } from '../types';

import { ResourcesList } from './ResourcesList';

interface ResourceSelectorToggleProps {
  resource: Resource;
}

const useSearch = (categoryUuid: string, projectUuid: string) => {
  const [query, setQuery] = useState('');

  const params = {
    query: query,
    category_uuid: categoryUuid,
    project_uuid: projectUuid,
    state: ['Creating', 'OK', 'Erred', 'Updating', 'Terminating'],
  };

  const result = useQuery(
    [`project-resource-search`, query],
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
            'project_uuid',
            'state',
          ],
        },
      }).then((response) => response.data),
    { enabled: !!query },
  );
  return { query, setQuery, result };
};

const ResourceSelectorDropdown: FunctionComponent<ResourceSelectorToggleProps> =
  (props) => {
    const { query, setQuery, result } = useSearch(
      props.resource?.category_uuid,
      props.resource?.project_uuid,
    );

    const refResourceSelector = useRef<HTMLDivElement>();
    const refSearch = useRef<HTMLInputElement>();
    const isVisible = useOnScreen(refResourceSelector);

    const doSearch = () => {
      result.refetch();
    };

    // Search input autofocus and load data on first visibility
    useEffect(() => {
      if (isVisible && refSearch.current) {
        refSearch.current.focus();
        doSearch();
      }
    }, [isVisible]);

    return (
      <div
        ref={refResourceSelector}
        className="resource-selector-dropdown menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary border mw-500px fw-bold rounded-0 fs-6"
        data-kt-menu="true"
      >
        <form
          className="w-100 d-flex align-items-center position-relative px-5 py-1 border-bottom"
          autoComplete="off"
        >
          <span className="svg-icon svg-icon-2 svg-icon-lg-1 svg-icon-dark">
            <SearchIcon />
          </span>
          <input
            ref={refSearch}
            type="text"
            className="form-control form-control-flush"
            name="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={translate('Find resource') + '...'}
            autoComplete="off"
          />
          <span
            className={classNames(
              'me-1',
              result.status === 'loading' ? '' : 'd-none',
            )}
          >
            <span className="spinner-border h-15px w-15px align-middle text-gray-400"></span>
          </span>
          <span
            className={classNames(
              'btn btn-flush btn-active-color-primary',
              result.status === 'success' && query ? '' : 'd-none',
            )}
            onClick={() => setQuery('')}
          >
            <span className="svg-icon svg-icon-2 svg-icon-lg-1 me-0">
              <i className="fa fa-times" />
            </span>
          </span>
        </form>

        <ResourcesList
          resources={result.data}
          loading={result.status === 'loading'}
        />

        <Row className="bg-light border g-0">
          <Col xs={6}>
            <Link
              className="btn btn-lg btn-link text-dark w-100 text-decoration-underline"
              state="marketplace-project-resources"
              params={{
                uuid: props.resource.project_uuid,
                category_uuid: props.resource.category_uuid,
              }}
              onClick={() => MenuComponent.hideDropdowns(undefined)}
            >
              {translate('Show {category} resources', {
                category: props.resource.category_title,
              })}
            </Link>
          </Col>
          <Col xs={6}>
            <Link
              className="btn btn-lg btn-link text-dark w-100 text-decoration-underline"
              state="marketplace-project-resources-all"
              params={{ uuid: props.resource.project_uuid }}
              onClick={() => MenuComponent.hideDropdowns(undefined)}
            >
              {translate('Show all resources')}
            </Link>
          </Col>
        </Row>
      </div>
    );
  };

export const ResourceSelectorToggle: FunctionComponent<ResourceSelectorToggleProps> =
  (props) => {
    const scroll = () => {
      const el = document.getElementById('resource-selector-wrapper');
      window.scroll({
        behavior: 'smooth',
        left: 0,
        top: el.offsetTop,
      });
    };

    return (
      <div
        id="resource-selector-wrapper"
        className="resource-selector-wrapper d-flex align-items-center"
      >
        <div>
          <div
            className="resource-selector-toggle btn btn-flush d-flex align-items-center mb-2"
            data-kt-menu-trigger="click"
            data-kt-menu-attach="parent"
            data-kt-menu-placement="bottom"
            onClick={scroll}
          >
            <h3 className="text-decoration-underline mb-0 me-2">
              {props.resource.name}
            </h3>
            <i className="fa fa-caret-down fs-4 text-dark"></i>
          </div>
          <ResourceSelectorDropdown resource={props.resource} />
        </div>
        <CopyToClipboardButton
          value={props.resource.name}
          className="mx-2 text-hover-primary cursor-pointer"
        />
      </div>
    );
  };
