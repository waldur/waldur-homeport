import { CaretDownIcon, FunnelSimpleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, Stack } from 'react-bootstrap';
import { Form, useForm } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { Project } from 'waldur-js-client';

import { BaseButton, Popover, PopoverContent, PopoverTrigger } from 'waldur-ui';

import { getInitialValues, syncFiltersToURL } from '@/core/filters';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useOrganizationAndProjectAutocompletesForResources } from '@/navigation/sidebar/resources-filter/utils';
import { useUser } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

import { OrganizationAutocomplete } from '../orders/OrganizationAutocomplete';
import { ProjectAutocomplete } from '../resources/list/ProjectAutocomplete';

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
      <ProjectAutocomplete
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
    useOrganizationAndProjectAutocompletesForResources();

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
        <Popover open={show} onOpenChange={setShow}>
          <PopoverTrigger asChild>
            <BaseButton
              type="button"
              id="marketplace-landing-filter-toggle"
              variant="tertiary"
              className={classNames('text-nowrap', show && 'active')}
              iconNode={<FunnelSimpleIcon size={20} weight="bold" />}
              label={
                <>
                  {translate('Organization')} & {translate('Project')}
                  <CaretDownIcon
                    size={18}
                    className="rotate-toggle-180"
                    weight="bold"
                  />
                </>
              }
            />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={2}
            // react-bootstrap's Dropdown.Menu auto-generated this pointing
            // at the Toggle's id; Radix has no equivalent auto-wiring, so
            // it has to be set explicitly here — both for a11y and because
            // the E2E suite's MarketplaceFilter.open() page object asserts
            // on this exact selector.
            aria-labelledby="marketplace-landing-filter-toggle"
            // A form, not a menu, so a plain Popover. The Card draws the
            // panel's border; the content keeps the menus' layer, so it
            // stacks like the other dropdowns, and Metronic's dropdown
            // entrance (on Content so that Radix holds it back until the
            // panel is positioned, see waldur-design-tokens/animations.css).
            className="z-dropdown-menu min-w-400px border-0 animate-[waldur-menu-enter-up_0.3s_ease] motion-reduce:animate-none"
          >
            <Card className="fs-5 shadow-sm m-0">
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
                  <BaseButton
                    variant="tertiary"
                    className="flex-equal"
                    onClick={() => setShow(false)}
                    label={translate('Cancel')}
                    size="lg"
                  />
                  <SubmitButton
                    submitting={false}
                    className="flex-equal"
                    label={translate('Apply')}
                  />
                </Stack>
              </Card.Body>
            </Card>
          </PopoverContent>
        </Popover>
      )}
    />
  );
};
