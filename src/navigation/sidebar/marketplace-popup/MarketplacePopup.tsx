import { debounce } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';
import { Project } from 'waldur-js-client';

import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { setMarketplaceFilter } from '@/marketplace/landing/filter/store/actions';
import { OrganizationAutocomplete } from '@/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@/marketplace/resources/list/ProjectFilter';
import { ModalDialog } from '@/modal/ModalDialog';
import { Customer } from '@/workspace/types';

import { sidebarResourcesFilterSelector } from '../resources-filter/utils';

import { DataLoader } from './DataLoader';

const ADD_RESOURCE_DIALOG_FORM = 'AddResourceDialogForm';

interface MarketplacePopupProps {
  resolve?: {
    organization?: Customer;
    project?: Project;
    categoryUuid?: string;
  };
}

interface FormData {
  organization?: Customer;
  project?: Project;
}

export const MarketplacePopup = reduxForm<FormData, MarketplacePopupProps>({
  form: ADD_RESOURCE_DIALOG_FORM,
  destroyOnUnmount: false,
})((props) => {
  const [filter, setFilter] = useState('');

  const dispatch = useDispatch<any>();
  const formValues = useSelector(getFormValues(props.form)) as FormData;

  // Apply active sidebar resources filters
  const sidebarResourcesFilters = useSelector(sidebarResourcesFilterSelector);

  // Init filters (if exists)
  // props.resolve filter is preferred over sidebar resources filter
  const [ready, setReady] = useState(false); // To avoid unnecessary fetching of categories data
  useEffect(() => {
    const preferredFilter =
      props.resolve?.organization || props.resolve?.project
        ? props.resolve
        : sidebarResourcesFilters;
    dispatch(props.change('organization', preferredFilter?.organization));
    dispatch(props.change('project', preferredFilter?.project));
    setReady(true);
  }, []);

  // `formValues` from redux-form's getFormValues selector is a fresh object on
  // every store update, so depending on it directly causes these effects to
  // refire on every render -- including spurious ones triggered by ancestor
  // re-renders, react-query subscriptions, or our own dispatches below
  // (the second effect dispatches setMarketplaceFilter which updates store
  // state that the form selector reads, completing a render-storm loop).
  // Pluck the only fields actually consumed and depend on those primitive /
  // small-object references instead.
  const organization = formValues?.organization;
  const project = formValues?.project;
  const organizationUuid = organization?.uuid;
  const projectCustomerUuid = project?.customer_uuid;

  // Clear project filter if organization is cleared
  useEffect(() => {
    if (!project || !organization) return;
    if (organizationUuid !== projectCustomerUuid) {
      dispatch(props.change('project', undefined));
    }
  }, [
    organization,
    project,
    organizationUuid,
    projectCustomerUuid,
    dispatch,
    props.change,
  ]);

  useEffect(() => {
    if (!formValues) {
      return;
    }
    dispatch(
      setMarketplaceFilter({
        name: 'organization',
        value: organization,
      }),
    );
    dispatch(setMarketplaceFilter({ name: 'project', value: project }));
    // Depending on `organization`/`project` (the actual values dispatched)
    // rather than the wrapping `formValues` reference avoids refiring on
    // every render. The values themselves are still react-redux references
    // that change only when the underlying form state genuinely changes.
  }, [organization, project, dispatch, formValues]);

  const applyQuery = useCallback(
    debounce((value) => {
      setFilter(String(value).trim());
    }, 500),
    [setFilter],
  );

  return (
    <ModalDialog
      title={translate('Add resource')}
      subtitle={translate(
        'Select an organization and project, then choose a category, an offering, and follow the prompts',
      )}
      headerClassName="pb-4"
      bodyClassName="p-0 pb-4"
    >
      <div id="marketplaces-selector">
        <div className="px-7">
          <Row className="gx-4 mb-4">
            <Col lg={6} className="mb-4 mb-lg-0">
              <OrganizationAutocomplete
                placeholder={translate('Select an organization')}
              />
            </Col>
            <Col lg={6}>
              <ProjectFilter
                customer_uuid={formValues?.organization?.uuid}
                isDisabled={!formValues?.organization?.uuid}
                placeholder={translate('Select a project')}
              />
            </Col>
          </Row>
          <Row className="mb-4">
            <Col xs={12}>
              <FilterBox
                id="marketplaces-selector-search-box"
                type="search"
                placeholder={translate('Search an offering')}
                onChange={(e) => applyQuery(e.target.value)}
                autoFocus
              />
            </Col>
          </Row>
        </div>
        <div className="border-bottom mx-7" />
        {ready && (
          <DataLoader
            filter={filter}
            customer={formValues?.organization}
            project={formValues?.project}
            categoryUuid={props.resolve?.categoryUuid}
          />
        )}
      </div>
    </ModalDialog>
  );
});
