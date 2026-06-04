import { debounce } from 'lodash-es';
import { FC, useCallback, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Form, useForm, useFormState } from 'react-final-form';
import { useSelector } from 'react-redux';

import { required } from '@/core/validators';
import { FilterBox } from '@/form/FilterBox';
import { SubmitButton } from '@/form/SubmitButton';
import { formatJsxTemplate, translate } from '@/i18n';
import { OrganizationAutocomplete } from '@/marketplace/orders/OrganizationAutocomplete';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { DataLoader } from '@/navigation/sidebar/marketplace-popup/DataLoader';
import { sidebarResourcesFilterSelector } from '@/navigation/sidebar/resources-filter/utils';
import { ActionButton } from '@/table/ActionButton';

import { ProjectAutocomplete } from '../list/ProjectAutocomplete';

import { ImportButton } from './ImportButton';
import { ResourcesList } from './ResourcesList';
import { ImportDialogProps } from './types';
import { FormData, useImportDialog } from './useImportDialog';

const ResourceImportDialogForm: FC<{ categoryUuid?: string }> = ({
  categoryUuid,
}) => {
  const form = useForm<FormData>();
  const { values, submitting } = useFormState<FormData>();

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
    onSubmit,
  } = useImportDialog(form, values);

  const [filter, setFilter] = useState('');

  // Clear project filter if organization is cleared or changed
  useEffect(() => {
    if (!project) return;
    if (!organization || organization.uuid !== project.customer_uuid) {
      form.change('project', undefined);
    }
  }, [organization, project, form]);

  const applyQuery = useCallback(
    debounce((value) => {
      setFilter(String(value).trim());
    }, 500),
    [],
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      <ModalDialog
        title={translate('Import resource')}
        subtitle={
          <>
            <span className="fw-bolder">
              {translate('Step {step}: ', { step })}
            </span>
            <span className="fw-bold">
              {step === 1
                ? translate('Select target organization and project')
                : step === 2
                  ? translate('Select source offering')
                  : translate(
                      'Select resources to import from {offering_name} to {organization_project}',
                      {
                        offering_name: <strong>{offering?.name}</strong>,
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
        bodyClassName="px-0"
        footer={
          <>
            {step === 1 ? (
              <CloseDialogButton className="flex-equal" />
            ) : (
              <ActionButton
                variant="tertiary"
                className="flex-equal"
                action={() => setStep((current) => current - 1)}
                title={translate('Back')}
              />
            )}
            {step === 1 || step === 2 ? (
              <SubmitButton
                className="flex-equal"
                disabled={!nextEnabled}
                submitting={false}
                type="button"
                onClick={() => setStep((current) => current + 1)}
                label={translate('Next')}
              />
            ) : (
              <ImportButton disabled={!submitEnabled} submitting={submitting} />
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
                  <ProjectAutocomplete
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
                categoryUuid={categoryUuid}
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
                  categoryUuid={categoryUuid}
                />
              )}
            </div>
          )}
        </div>
      </ModalDialog>
    </form>
  );
};

export const ResourceImportDialog: FC<ImportDialogProps> = (props) => {
  const initialValues = useSelector(sidebarResourcesFilterSelector);

  return (
    <Form<FormData>
      onSubmit={() => {}}
      initialValues={initialValues}
      render={() => (
        <ResourceImportDialogForm categoryUuid={props.resolve?.category_uuid} />
      )}
    />
  );
};
