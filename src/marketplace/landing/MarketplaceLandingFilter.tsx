import { CaretDownIcon, FunnelSimpleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { Card, Dropdown, Stack } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';
import { Project } from 'waldur-js-client';

import { getInitialValues, syncFiltersToURL } from '@waldur/core/filters';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { useOrganizationAndProjectFiltersForResources } from '@waldur/navigation/sidebar/resources-filter/utils';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { MARKETPLACE_LANDING_FILTER_FORM } from '../constants';
import { OrganizationAutocomplete } from '../orders/OrganizationAutocomplete';
import { ProjectFilter } from '../resources/list/ProjectFilter';

import { setMarketplaceFilter } from './filter/store/actions';

import './MarketplaceLandingFilter.scss';

const filterItems = [
  { label: translate('Organization'), name: 'organization' },
  { label: translate('Project'), name: 'project' },
];

interface FormData {
  organization?: Customer;
  project?: Project;
}

export const MarketplaceLandingFilter = reduxForm<FormData>({
  form: MARKETPLACE_LANDING_FILTER_FORM,
  destroyOnUnmount: false,
  initialValues: getInitialValues(),
})((props) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch<any>();
  const [show, setShow] = useState(false);

  const formValues = useSelector(
    getFormValues(MARKETPLACE_LANDING_FILTER_FORM),
  ) as FormData;

  const { syncResourceFilters } =
    useOrganizationAndProjectFiltersForResources();

  const apply = useCallback(
    (formData) => {
      filterItems.forEach((item) => {
        dispatch(
          setMarketplaceFilter({
            label: item.label,
            name: item.name,
            value: formData[item.name],
            getValueLabel: (value) => value?.name,
          }),
        );
      });
      setShow(false);
      syncFiltersToURL(formData);
      syncResourceFilters(formData);
    },
    [setShow, dispatch, syncResourceFilters],
  );

  // To initialize & apply filters (from URL)
  // Logic moved to shared syncResourceFilters hook

  // Clear project filter if organization is cleared
  useEffect(() => {
    if (!formValues?.project) return;
    if (!formValues?.organization) {
      dispatch(props.change('project', undefined));
      apply({ ...formValues, project: null });
    } else if (
      formValues.project.customer_uuid &&
      formValues.organization.uuid !== formValues.project.customer_uuid
    ) {
      dispatch(props.change('project', undefined));
      apply({ ...formValues, project: null });
    }
  }, [formValues?.organization?.uuid, formValues?.project?.uuid, props.change]);

  if (!user) return null;

  return (
    <Dropdown show={show} onToggle={setShow} align="end" autoClose={false}>
      <Dropdown.Toggle
        variant="tertiary"
        className={classNames(
          'd-flex text-nowrap btn-icon-right no-arrow',
          show && 'active',
        )}
        id="marketplace-landing-filter-toggle"
      >
        <FunnelSimpleIcon size={20} className="svg-icon" weight="bold" />
        {translate('Organization')} & {translate('Project')}
        <CaretDownIcon
          size={18}
          className="svg-icon rotate-180 ms-2 me-0"
          weight="bold"
        />
      </Dropdown.Toggle>
      <Dropdown.Menu className="p-0 border-0 min-w-400px">
        <Card className="menu menu-sub menu-sub-dropdown menu-gray-800 menu-hover-bg-light menu-hover-title-primary fs-5 show shadow-sm m-0">
          <Card.Body
            as="form"
            onSubmit={props.handleSubmit(apply)}
            className="d-flex flex-column gap-8"
          >
            <div>
              <Card.Title as="div" className="h3 mb-5">
                {translate('Filter by organization/project')}
              </Card.Title>
              <Card.Subtitle className="fw-normal text-muted">
                {translate('Filter results by chosen organization and project')}
              </Card.Subtitle>
            </div>
            <OrganizationAutocomplete />
            <ProjectFilter
              customer_uuid={formValues?.organization?.uuid}
              isDisabled={!formValues?.organization?.uuid}
            />

            <Stack direction="horizontal" gap={4}>
              <ActionButton
                variant="tertiary"
                className="flex-equal"
                action={() => setShow(false)}
                title={translate('Cancel')}
              />
              <SubmitButton
                submitting={false}
                className="flex-equal"
                label={translate('Apply')}
              />
            </Stack>
          </Card.Body>
        </Card>
      </Dropdown.Menu>
    </Dropdown>
  );
});
