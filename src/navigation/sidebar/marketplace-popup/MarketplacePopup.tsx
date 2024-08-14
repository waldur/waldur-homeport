import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { FilterBox } from '@waldur/form/FilterBox';
import { translate } from '@waldur/i18n';
import { setMarketplaceFilter } from '@waldur/marketplace/landing/filter/store/actions';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { Customer, Project } from '@waldur/workspace/types';

import { DataLoader } from './DataLoader';

export const RECENTLY_ADDED_OFFERINGS_UUID =
  'recently_added_offerings_category';

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

  // Init filters (if exists)
  const [ready, setReady] = useState(false); // To avoid unnecessary fetching of categories data
  useEffect(() => {
    dispatch(props.change('organization', props.resolve?.organization));
    dispatch(props.change('project', props.resolve?.project));
    setReady(true);
  }, []);

  // Clear project filter if organization is cleared
  useEffect(() => {
    if (!formValues?.project) return;
    if (
      !formValues?.organization ||
      formValues.organization.uuid !== formValues.project.customer_uuid
    ) {
      dispatch(props.change('project', undefined));
    }
  }, [formValues, props.change]);

  useEffect(() => {
    if (!formValues) {
      return;
    }
    dispatch(
      setMarketplaceFilter({
        name: 'organization',
        value: formValues.organization,
      }),
    );
    dispatch(
      setMarketplaceFilter({ name: 'project', value: formValues.project }),
    );
  }, [formValues, props.change]);

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
      closeButton
      bodyClassName="p-0 pb-4"
      headerClassName="border-0 pb-4"
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
                inputClassName="placeholder-gray-700"
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
