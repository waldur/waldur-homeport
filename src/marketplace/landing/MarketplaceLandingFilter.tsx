import { CaretDownIcon, FunnelSimpleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, Dropdown, Stack } from 'react-bootstrap';
import { Form, useForm } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { Project } from 'waldur-js-client';

import { getInitialValues, syncFiltersToURL } from '@/core/filters';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useOrganizationAndProjectFiltersForResources } from '@/navigation/sidebar/resources-filter/utils';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

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

const LandingFilterFields = ({ values }) => {
  const form = useForm();
  const organization = values?.organization;
  const project = values?.project;
  const organizationUuid = organization?.uuid;

  const prevOrgUuid = useRef(organizationUuid);

  // Clear project filter if organization changes
  useEffect(() => {
    if (prevOrgUuid.current !== organizationUuid) {
      prevOrgUuid.current = organizationUuid;
      if (project) {
        form.change('project', undefined);
      }
    }
  }, [organizationUuid, project, form]);

  return (
    <>
      <OrganizationAutocomplete />
      <ProjectFilter
        customer_uuid={organizationUuid}
        isDisabled={!organizationUuid}
      />
    </>
  );
};

export const MarketplaceLandingFilter = () => {
  const user = useUser();
  const dispatch = useDispatch<any>();
  const [show, setShow] = useState(false);

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

  if (!user) return null;

  return (
    <Form<FormData>
      onSubmit={apply}
      initialValues={getInitialValues()}
      render={({ handleSubmit, values }) => (
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
                onSubmit={handleSubmit}
                className="d-flex flex-column gap-8"
              >
                <div>
                  <Card.Title as="div" className="h3 mb-5">
                    {translate('Filter by organization/project')}
                  </Card.Title>
                  <Card.Subtitle className="fw-normal text-muted">
                    {translate(
                      'Filter results by chosen organization and project',
                    )}
                  </Card.Subtitle>
                </div>
                <LandingFilterFields values={values} />

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
      )}
    />
  );
};
