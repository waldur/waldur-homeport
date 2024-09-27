import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Form, reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FilterBox } from '@waldur/form/FilterBox';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';
import { DataLoader } from '@waldur/navigation/sidebar/marketplace-popup/DataLoader';

import { ProjectFilter } from '../list/ProjectFilter';

import { ImportButton } from './ImportButton';
import { ResourcesList } from './ResourcesList';
import { ImportDialogProps } from './types';
import { IMPORT_RESOURCE_FORM_ID, useImportDialog } from './useImportDialog';

export const ResourceImportDialog = reduxForm<{}, ImportDialogProps>({
  form: IMPORT_RESOURCE_FORM_ID,
})((props) => {
  const {
    step,
    setStep,
    offering,
    organization,
    project,
    selectOffering,
    plans,
    assignPlan,
    nextEnabled,
    submitEnabled,
    handleSubmit,
  } = useImportDialog();

  const [filter, setFilter] = useState('');

  const dispatch = useDispatch<any>();

  // Clear project filter if organization is cleared
  useEffect(() => {
    if (!project) return;
    if (!organization || organization.uuid !== project.customer_uuid) {
      dispatch(props.change('project', undefined));
    }
  }, [organization, project, props.change]);

  const applyQuery = useCallback(
    debounce((value) => {
      setFilter(String(value).trim());
    }, 500),
    [setFilter],
  );

  return (
    <Form onSubmit={props.handleSubmit(handleSubmit)}>
      <MetronicModalDialog
        title={translate('Import resource')}
        subtitle={
          <>
            <span className="fw-bolder">
              {translate('Step') + ` ${step}: `}
            </span>
            <span className="fw-bold">
              {step === 1
                ? translate('Select target organization and project')
                : step === 2
                  ? translate('Select source offering')
                  : translate(
                      'Select resources to import from {offering_name} to {organization_project}',
                      {
                        offering_name: <strong>{offering.name}</strong>,
                        organization_project: (
                          <strong>
                            {organization?.name}
                            {' / '}
                            {project?.name}
                          </strong>
                        ),
                      },
                      formatJsxTemplate,
                    )}
            </span>
          </>
        }
        bodyClassName="px-0 pt-6"
        footer={
          <>
            {step === 1 ? (
              <CloseDialogButton className="flex-equal" />
            ) : (
              <Button
                variant="outline btn-outline-default"
                className="flex-equal"
                onClick={() => setStep((current) => current - 1)}
              >
                {translate('Back')}
              </Button>
            )}
            {step === 1 || step === 2 ? (
              <Button
                className="flex-equal"
                disabled={!nextEnabled}
                onClick={() => setStep((current) => current + 1)}
              >
                {translate('Next')}
              </Button>
            ) : (
              <ImportButton
                disabled={!submitEnabled}
                submitting={props.submitting}
              />
            )}
          </>
        }
      >
        <div id="marketplaces-selector">
          {step === 1 ? (
            // STEP 1
            <div className="px-7">
              <Row className="gx-4 mb-4">
                <Col lg={6} className="mb-4 mb-lg-0">
                  <OrganizationAutocomplete
                    placeholder={translate('Select an organization')}
                    validator={required}
                  />
                </Col>
                <Col lg={6}>
                  <ProjectFilter
                    customer_uuid={organization?.uuid}
                    isDisabled={!organization?.uuid}
                    placeholder={translate('Select a project')}
                    validator={required}
                  />
                </Col>
              </Row>
            </div>
          ) : step === 2 ? (
            // STEP 2
            <>
              <div className="px-7">
                <Row className="mb-4">
                  <Col xs={12}>
                    <FilterBox
                      id="import-resource-search-box"
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
              <DataLoader
                filter={filter}
                customer={organization}
                project={project}
                categoryUuid={props.resolve?.category_uuid}
                onSelectOffering={selectOffering}
                showRecentlyAddedOfferings={false}
                importableOfferings
              />
            </>
          ) : (
            // STEP 3
            <div className="px-7">
              {Boolean(offering) && (
                <ResourcesList
                  offering={offering}
                  plans={plans}
                  assignPlan={assignPlan}
                  categoryUuid={props.resolve?.category_uuid}
                />
              )}
            </div>
          )}
        </div>
      </MetronicModalDialog>
    </Form>
  );
});
