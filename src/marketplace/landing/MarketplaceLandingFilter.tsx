import { CaretDownIcon, FunnelSimpleIcon } from '@phosphor-icons/react';
import * as RadixPopover from '@radix-ui/react-popover';
import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, Stack } from 'react-bootstrap';
import { Form, useForm } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { Project } from 'waldur-js-client';

import { getInitialValues, syncFiltersToURL } from '@/core/filters';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useOrganizationAndProjectAutocompletesForResources } from '@/navigation/sidebar/resources-filter/utils';
import { ActionButton } from '@/table/ActionButton';
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
        <RadixPopover.Root open={show} onOpenChange={setShow} modal={false}>
          <RadixPopover.Trigger asChild>
            <button
              type="button"
              id="marketplace-landing-filter-toggle"
              className={classNames(
                'btn dropdown-toggle btn-tertiary d-flex text-nowrap btn-icon-right no-arrow',
                show && 'active',
              )}
            >
              <FunnelSimpleIcon size={20} className="svg-icon" weight="bold" />
              {translate('Organization')} & {translate('Project')}
              <CaretDownIcon
                size={18}
                className="svg-icon rotate-toggle-180 ms-2 me-0"
                weight="bold"
              />
            </button>
          </RadixPopover.Trigger>
          <RadixPopover.Portal>
            <RadixPopover.Content
              align="end"
              sideOffset={2}
              // react-bootstrap's Dropdown.Menu auto-generated this pointing
              // at the Toggle's id; Radix has no equivalent auto-wiring, so
              // it has to be set explicitly here — both for a11y and because
              // the E2E suite's MarketplaceFilter.open() page object asserts
              // on this exact selector.
              aria-labelledby="marketplace-landing-filter-toggle"
              // position-static: the Radix popper wrapper is the positioned
              // element here, and leaving `.dropdown-menu`'s own
              // `position: absolute` in place takes this panel out of that
              // wrapper's flow and collapses its measured size — reported
              // live as its own contents (Apply button, select clear icon)
              // landing outside the viewport. Same fix as ActionsDropdown.tsx's
              // own Content, and the systemic issue described there.
              className="dropdown-menu show p-0 border-0 min-w-400px position-static"
              // Mirrors the original Bootstrap Dropdown's autoClose={false}:
              // OrganizationAutocomplete/ProjectAutocomplete portal their own
              // react-select menu to document.body, outside this popover's
              // DOM subtree, so Radix's default dismiss-on-outside-click
              // would close the whole filter the moment either is opened.
              // Only the explicit Cancel/Apply handlers below call
              // setShow(false).
              onInteractOutside={(event) => event.preventDefault()}
            >
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
            </RadixPopover.Content>
          </RadixPopover.Portal>
        </RadixPopover.Root>
      )}
    />
  );
};
