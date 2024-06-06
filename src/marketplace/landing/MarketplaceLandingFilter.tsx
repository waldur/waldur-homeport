import { CaretDown, FunnelSimple } from '@phosphor-icons/react';
import { useCallback, useEffect, useState } from 'react';
import { Button, Card, OverlayTrigger, Popover, Stack } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { getInitialValues, syncFiltersToURL } from '@waldur/core/filters';
import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

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
    },
    [setShow, dispatch],
  );

  // To initialize & apply filters (from URL)
  useEffect(() => formValues && apply(formValues), []);

  // Clear project filter if organization is cleared
  useEffect(() => {
    if (!formValues?.project) return;
    if (
      !formValues?.organization ||
      formValues.organization.uuid !== formValues.project.customer_uuid
    ) {
      dispatch(props.change('project', undefined));
      const newValues = { ...formValues, project: null };
      apply(newValues);
    }
  }, [formValues, props.change]);

  if (!user) return null;

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom-end"
      show={show}
      overlay={
        <Popover id="MarketplaceLandingFilter">
          <Card className="menu menu-sub menu-sub-dropdown menu-gray-800 menu-hover-bg-light menu-hover-title-primary fs-5 show shadow-sm">
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
                  {translate(
                    'Filter results by chosen organization and project',
                  )}
                </Card.Subtitle>
              </div>
              <OrganizationAutocomplete />
              <ProjectFilter
                customer_uuid={formValues?.organization?.uuid}
                isDisabled={!formValues?.organization?.uuid}
              />
              <Stack direction="horizontal" gap={4}>
                <Button
                  variant="outline"
                  className="btn-outline-default flex-equal"
                  onClick={() => setShow(false)}
                >
                  {translate('Cancel')}
                </Button>
                <Button type="submit" className="flex-equal">
                  {translate('Apply')}
                </Button>
              </Stack>
            </Card.Body>
          </Card>
        </Popover>
      }
    >
      <Button
        variant="outline"
        className={
          'btn-outline-default d-flex text-nowrap' + (show ? ' active' : '')
        }
        onClick={() => setShow((v) => !v)}
      >
        <FunnelSimple size={20} className="svg-icon" />
        {translate('Organization')} & {translate('Project')}
        <CaretDown size={18} className="svg-icon rotate-180 ms-2 me-0" />
      </Button>
    </OverlayTrigger>
  );
});
