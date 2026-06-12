import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pick } from 'lodash-es';
import { DateTime } from 'luxon';
import { FC, useCallback, useMemo, useState } from 'react';
import { FormCheck, FormText } from 'react-bootstrap';
import { Field, Form, FormRenderProps, useField } from 'react-final-form';
import { useSelector } from 'react-redux';
import {
  marketplaceResourcesList,
  marketplaceResourcesPartialUpdate,
  projectsPartialUpdate,
  Resource,
} from 'waldur-js-client';
import { Project } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { Badge } from '@/core/Badge';
import { formatDate, formatISODate, parseDate } from '@/core/dateUtils';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { FormGroup } from '@/form';
import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';
import { NON_TERMINATED_STATES } from '@/marketplace/resources/list/constants';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';
import { createClientPaginatedFetcher } from '@/table/api';
import { selectSelectedRows } from '@/table/selectors';
import Table from '@/table/Table';
import { TableProps } from '@/table/types';
import { useTable } from '@/table/useTable';
import { useSetProject } from '@/workspace/hooks';

import { EditProjectProps } from '../types';

const TABLE_ID = 'projectEndibleResources';
const RESOURCES_QUERY_ID = 'project-endible-resources';

const StateField = ({ row, projectDate }: { row; projectDate: DateTime }) => {
  const date = parseDate(row.end_date);
  return date.hasSame(projectDate, 'day') ? (
    <Badge variant="success" size="sm" pill outline>
      {translate('Aligned')}
    </Badge>
  ) : date > projectDate ? (
    <Badge variant="danger" size="sm" pill outline>
      {translate('After project')}
    </Badge>
  ) : (
    <Badge variant="warning" size="sm" pill outline>
      {translate('Before project')}
    </Badge>
  );
};

const ResourcesTable: FC<TableProps & { projectDate }> = ({
  projectDate,
  ...props
}) => (
  <Table
    {...props}
    columns={[
      {
        title: translate('Resource name'),
        render: ({ row }) => <span className="text-dark">{row.name}</span>,
      },
      {
        title: translate('Termination date'),
        render: ({ row }) => <>{formatDate(row.end_date)}</>,
      },
      {
        title: translate('Offering / Category'),
        render: ({ row }) => (
          <>
            <span className="d-block text-dark">{row.offering_name}</span>
            <span className="d-block">{row.category_title}</span>
          </>
        ),
      },
      {
        title: translate('State'),
        render: ({ row }) => <StateField row={row} projectDate={projectDate} />,
      },
    ]}
    fullWidth
    cardBordered={false}
    hasActionBar={false}
    minHeight="auto"
    hasPagination={false}
    enableMultiSelect={props.enableMultiSelect}
  />
);

const FormModalComponent: FC<
  FormRenderProps<FormData, Partial<Project>> & { project: Project }
> = ({ invalid, handleSubmit, submitting, project }) => {
  const value = useField('end_date');
  const valueDate = useMemo(() => {
    if (!value.input?.value) return null;
    return parseDate(value.input.value);
  }, [value]);

  const selectedResources = useSelector(selectSelectedRows(TABLE_ID));
  const [confirm, setConfirm] = useState(false);
  const [step, setStep] = useState(1);

  const {
    data: resources,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: [RESOURCES_QUERY_ID, project.uuid],

    queryFn: () => {
      if (!project.resources_count) return Promise.resolve(null);

      return getAllPages((page) =>
        marketplaceResourcesList({
          query: {
            page,
            field: [
              'uuid',
              'name',
              'end_date',
              'offering_name',
              'category_title',
            ],

            project_uuid: project.uuid,
            state: NON_TERMINATED_STATES,
            has_terminate_date: true,
          },
        }),
      );
    },

    refetchOnWindowFocus: false,
    enabled: !!value.input.value && value.meta.dirty,
  });

  const ignoredResources = useMemo(() => {
    const items: Resource[] = [];
    if (resources?.length && selectedResources)
      resources.forEach((resource) => {
        if (
          !selectedResources.some(
            (selected) => selected.uuid === resource.uuid,
          ) &&
          parseDate(resource.end_date) > valueDate
        ) {
          items.push(resource);
        }
      });
    return items;
  }, [selectedResources, resources, valueDate]);

  const tableProps = useTable({
    table: TABLE_ID,
    fetchData: createClientPaginatedFetcher(resources || []),
  });

  const tablePropsUnselected = useTable({
    table: TABLE_ID + '-unselected',
    fetchData: createClientPaginatedFetcher(ignoredResources),
  });

  const hasResources = resources?.length && value.meta.dirty;
  const hasUnselectedResources = step === 2 && ignoredResources.length > 0;
  const adjustModalHeight = hasResources || hasUnselectedResources;

  return (
    <form onSubmit={handleSubmit}>
      <ModalDialog
        title={
          step === 1
            ? translate('Set end date for project: {name}.', {
                name: project.name,
              })
            : translate('Some conflicting resources are unselected')
        }
        bodyClassName={
          adjustModalHeight ? 'd-flex flex-column h-400px' : 'h-200px'
        }
        footer={
          <>
            {step === 1 ? (
              <CloseDialogButton className="min-w-125px" />
            ) : (
              <ActionButton
                title={translate('Go back')}
                action={() => setStep(1)}
                variant="tertiary"
                className="min-w-125px"
              />
            )}
            <SubmitButton
              disabled={invalid || (selectedResources?.length > 0 && !confirm)}
              submitting={submitting}
              label={
                step === 1 ? translate('Save') : translate('Confirm & save')
              }
              className="btn btn-primary min-w-125px"
              onClick={(event) => {
                if (step === 1 && ignoredResources.length > 0) {
                  event.preventDefault();
                  setStep(2);
                }
              }}
            />
          </>
        }
      >
        <div className={step === 2 ? 'd-none' : 'd-flex flex-column h-100'}>
          <FormGroup controlId="project_end_date" spaceless>
            <Field
              name="end_date"
              component={DateField}
              minDate={DateTime.now().plus({ days: 1 }).toISO()}
            />

            <FormText className="text-gray-700">
              {translate(
                'Project end date supersedes resource termination date if resource termination date is after the project end date.',
              )}
            </FormText>
          </FormGroup>

          {isFetching ? (
            <LoadingSpinner />
          ) : error ? (
            <LoadingErred loadData={refetch} />
          ) : resources?.length && value.meta.dirty ? (
            <>
              <p className="text-gray-700 fw-bold mt-4">
                {translate(
                  "You've changed the project end date. Some resources now conflict with this date. Review the list below to align or confirm resource termination dates.",
                )}
              </p>
              <div
                className="flex-grow-1 overflow-auto"
                style={{ minHeight: 0 }}
              >
                <ResourcesTable
                  {...tableProps}
                  rows={resources || []}
                  enableMultiSelect
                  projectDate={valueDate}
                />
              </div>

              <FormCheck
                id="confirm-update-termination-dates"
                type="checkbox"
                className="form-check-custom form-check-sm pt-3"
                checked={confirm}
                onChange={(value) => setConfirm(value.target.checked)}
                label={translate(
                  'Update all selected resource termination dates to match project end date',
                )}
              />
            </>
          ) : null}
        </div>

        {step === 2 && (
          <div
            className="d-flex flex-column flex-grow-1"
            style={{ minHeight: 0 }}
          >
            <p className="text-gray-700 mb-4">
              {translate(
                'The following resources were not selected and will be forcibly terminated on the project end date:',
              )}
            </p>
            <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
              <ResourcesTable
                {...tablePropsUnselected}
                rows={ignoredResources}
                projectDate={valueDate}
              />
            </div>
          </div>
        )}
      </ModalDialog>
    </form>
  );
};

export const EditEndDateDialog = ({
  resolve,
}: {
  resolve: EditProjectProps;
}) => {
  const queryClient = useQueryClient();
  const setCurrentProject = useSetProject();

  const { closeDialog } = useModal();

  const { showSuccess, showErrorResponse, showError } = useNotify();

  const resources = queryClient.getQueryData<Resource[]>([
    'project-endible-resources',
    resolve.project.uuid,
  ]);

  const selectedResources = useSelector(
    selectSelectedRows(TABLE_ID),
  ) as Resource[];

  const onSubmit = useCallback(
    async (formData: FormData) => {
      try {
        const endDate = formData[resolve.name];

        // Update project end date
        const project = await projectsPartialUpdate({
          path: { uuid: resolve.project.uuid },
          body: {
            [resolve.name]: formatISODate(endDate),
          },
        });
        setCurrentProject(project.data);

        const title = translate(
          'Project end date was successfully updated to {date}',
          { date: formatDate(endDate) },
        );

        // Update selected resources termination date
        if (selectedResources?.length > 0) {
          const promises = selectedResources.map((resource) =>
            marketplaceResourcesPartialUpdate({
              path: { uuid: resource.uuid },
              body: { end_date: endDate ? formatISODate(endDate) : null },
            }),
          );
          const updatedResources: string[] = [];
          const erredResources: string[] = [];
          const ignoredResources: string[] = [];
          const projectEndDate = parseDate(endDate);
          resources.forEach((resource) => {
            if (
              !selectedResources.some(
                (selected) => selected.uuid === resource.uuid,
              ) &&
              parseDate(resource.end_date) > projectEndDate
            ) {
              ignoredResources.push(resource.name);
            }
          });
          await Promise.allSettled(promises).then((results) => {
            results.forEach((res, index) => {
              if (res.status === 'fulfilled') {
                updatedResources.push(res.value.data.name);
              } else {
                erredResources.push(selectedResources[index].name);
              }
            });
          });

          let message = '';
          if (updatedResources.length > 0) {
            message += translate(
              'The following resources had their termination dates updated: {list}.',
              { list: updatedResources.join(', ') },
            );
            if (ignoredResources.length > 0) {
              message += translate(
                'The following were not updated and be affected by the project end: {list}.',
                { list: ignoredResources.join(', ') },
              );
            }
          } else if (ignoredResources.length > 0) {
            message += translate(
              'The following resources were not updated and be affected by the project end: {list}.',
              { list: ignoredResources.join(', ') },
            );
          }
          showSuccess(title, message);
          if (erredResources.length > 0) {
            showError(
              translate(
                'The following resources could not be updated: {list}.',
                { list: erredResources.join(', ') },
              ),
            );
          }
        } else {
          showSuccess(title);
        }

        closeDialog();
      } catch (e) {
        showErrorResponse(e, translate('Project could not be updated.'));
      }
    },
    [resolve, resources, selectedResources],
  );

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={pick(resolve.project, resolve.name)}
      subscription={{
        values: true,
        invalid: true,
        dirty: true,
        submitting: true,
      }}
    >
      {(formProps) => (
        <FormModalComponent {...formProps} project={resolve.project} />
      )}
    </Form>
  );
};
