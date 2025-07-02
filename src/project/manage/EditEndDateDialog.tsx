import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pick } from 'lodash-es';
import { DateTime } from 'luxon';
import { FC, useCallback, useMemo, useState } from 'react';
import { Button, FormCheck, FormText } from 'react-bootstrap';
import { Field, Form, FormRenderProps, useField } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  marketplaceResourcesList,
  marketplaceResourcesPartialUpdate,
  projectsPartialUpdate,
  Resource,
} from 'waldur-js-client';
import { Project } from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { Badge } from '@waldur/core/Badge';
import { formatDate, formatISODate, parseDate } from '@waldur/core/dateUtils';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { NON_TERMINATED_STATES } from '@waldur/marketplace/resources/list/constants';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';
import { selectSelectedRows } from '@waldur/table/selectors';
import Table from '@waldur/table/Table';
import { TableProps } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { setCurrentProject } from '@waldur/workspace/actions';

import { EditProjectProps } from '../types';

const TABLE_ID = 'projectEndibleResources';
const RESOURCES_QUERY_ID = 'project-endible-resources';

const StateField = ({ row, projectDate }: { row; projectDate: DateTime }) => {
  const date = parseDate(row.end_date);
  return date.hasSame(projectDate, 'day') ? (
    <Badge variant="success" outline pill size="sm">
      {translate('Aligned')}
    </Badge>
  ) : date > projectDate ? (
    <Badge variant="danger" outline pill size="sm">
      {translate('After project')}
    </Badge>
  ) : (
    <Badge variant="warning" outline pill size="sm">
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
        title: translate('Offering') + '/' + translate('Category'),
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
    hasPagination
    initialPageSize={5}
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
    resources?.length &&
      selectedResources &&
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
    fetchData: () =>
      Promise.resolve({
        rows: resources || [],
        resultCount: resources?.length,
      }),
  });

  const tablePropsUnselected = useTable({
    table: TABLE_ID + '-unselected',
    fetchData: () =>
      Promise.resolve({
        rows: ignoredResources,
        resultCount: ignoredResources?.length,
      }),
  });

  return (
    <form onSubmit={handleSubmit}>
      <ModalDialog
        title={
          step === 1
            ? translate('Set end date for project') + ': ' + project.name
            : translate('Some conflicting resources are unselected')
        }
        bodyClassName="pt-5 min-h-200px"
        footer={
          <>
            {step === 1 ? (
              <CloseDialogButton className="min-w-125px" />
            ) : (
              <Button
                onClick={() => setStep(1)}
                variant="outline btn-outline-default"
                className="min-w-125px"
              >
                {translate('Go back')}
              </Button>
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
        <div className={step === 2 ? 'd-none' : undefined}>
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
              <ResourcesTable
                {...tableProps}
                enableMultiSelect
                projectDate={valueDate}
              />

              <FormCheck
                id="confirm-update-termination-dates"
                type="checkbox"
                className="form-check-custom form-check-sm"
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
          <>
            <p className="text-gray-700 mb-4">
              {translate(
                'The following resources were not selected and will be forcibly terminated on the project end date:',
              )}
            </p>
            <ResourcesTable {...tablePropsUnselected} projectDate={valueDate} />
          </>
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
  const dispatch = useDispatch();
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
        dispatch(setCurrentProject(project.data as any as Project));

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
            message +=
              translate(
                'The following resources had their termination dates updated',
              ) +
              ': ' +
              updatedResources.join(', ') +
              '. ';
            if (ignoredResources.length > 0) {
              message +=
                translate(
                  'The following were not updated and be affected by the project end',
                ) +
                ': ' +
                ignoredResources.join(', ') +
                '. ';
            }
          } else if (ignoredResources.length > 0) {
            message +=
              translate(
                'The following resources were not updated and be affected by the project end',
              ) +
              ': ' +
              ignoredResources.join(', ') +
              '. ';
          }
          dispatch(showSuccess(message, title));
          if (erredResources.length > 0) {
            showError(
              translate('The following resources could not be updated') +
                ': ' +
                erredResources.join(', ') +
                '. ',
            );
          }
        } else {
          showSuccess(title);
        }

        dispatch(closeModalDialog());
      } catch (e) {
        showErrorResponse(e, translate('Project could not be updated.'));
      }
    },
    [dispatch, resolve, resources, selectedResources],
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
