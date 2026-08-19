import { DateTime } from 'luxon';
import React from 'react';
import { projectsPartialUpdate, Project } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { parseDate } from '@/core/dateUtils';
import { CompactEditButton } from '@/form/CompactEditButton';
import {
  BooleanEditField,
  DateEditField,
  EditFieldProvider,
  MarkdownEditField,
  NumberEditField,
  SelectEditField,
  StringEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useNotify } from '@/store/notify';
import { renderFieldOrDash } from '@/table/utils';
import { useSetProject, useUser } from '@/workspace/hooks';

import { projectKindOptions } from '../utils';
import { validateProjectName } from '../validators';

import { EditEndDateDialog } from './EditEndDateDialog';
import { ProjectAvatar } from './ProjectAvatar';

interface ProjectGeneralProps {
  project: Project;
}

export const ProjectGeneral: React.FC<ProjectGeneralProps> = ({ project }) => {
  const user = useUser();
  const setProject = useSetProject();
  const { openDialog } = useModal();
  const { showErrorResponse } = useNotify();

  // Mirrors the backend, which guards writes to end_date with PROJECT.DELETE on
  // the customer. Gating on is_staff hid the edit from organization owners, who
  // are the role the backend actually grants it to.
  const canSetEndDate = hasPermission(user, {
    permission: PermissionEnum.DELETE_PROJECT,
    customerId: project.customer_uuid,
  });

  const updateProject = async (formData) => {
    try {
      const res = await projectsPartialUpdate({
        path: { uuid: project.uuid },
        body: formData,
      });
      setProject(res.data);
      return res;
    } catch (error) {
      showErrorResponse(error, translate('Unable to update project.'));
      throw error;
    }
  };

  return (
    <EditFieldProvider scope={project} callback={updateProject}>
      <ProjectAvatar project={project} />

      <FormTable.Card title={translate('Details')} className="card-bordered">
        <FormTable>
          <StringEditField
            name="name"
            label={translate('Name')}
            required
            placeholder={translate('e.g. Community Health Outreach')}
            description={translate(
              'This name will be visible in accounting data.',
            )}
            validate={(value, _allValues, meta) =>
              meta && !meta.active
                ? undefined
                : validateProjectName(value, {
                    customer: { uuid: project.customer_uuid },
                  })
            }
          />
          <StringEditField name="slug" label={translate('Slug')} isStaffOnly />
          <MarkdownEditField
            name="staff_notes"
            label={translate('Staff notes')}
            isStaffOnly
          />

          <FormTable.Item
            label={translate('Owner')}
            value={renderFieldOrDash(project.customer_name)}
          />

          <DateEditField
            name="start_date"
            label={translate('Start date')}
            description={translate(
              'Date when invitations are sent and resource orders processed.',
            )}
            disabled={
              project.start_date
                ? parseDate(project.start_date) < parseDate(null)
                : false
            }
            minDate={DateTime.now().toISO()}
          />

          <FormTable.Item
            label={translate('End date')}
            description={translate(
              'Date when termination orders are created; project is removed if resources are already terminated.',
            )}
            value={renderFieldOrDash(project.end_date)}
            actions={
              <>
                {canSetEndDate && (
                  <CompactEditButton
                    onClick={() =>
                      openDialog(EditEndDateDialog, {
                        resolve: { project, name: 'end_date' },
                        size: 'lg',
                      })
                    }
                  />
                )}
              </>
            }
          />

          <NumberEditField
            name="grace_period_days"
            label={translate('Grace period (days)')}
            description={
              project.customer_grace_period_days != null
                ? translate(
                    'Number of extra days after project end date before resources are terminated. Overrides customer-level setting (organization default: {days} days).',
                    { days: project.customer_grace_period_days },
                  )
                : translate(
                    'Number of extra days after project end date before resources are terminated. Overrides customer-level setting.',
                  )
            }
            min={0}
            renderValue={(v) =>
              v ?? project.customer_grace_period_days ?? renderFieldOrDash(null)
            }
            isStaffOnly
          />

          {project.effective_end_date && project.grace_period_days > 0 && (
            <FormTable.Item
              label={translate('Resource termination date')}
              description={translate(
                'The actual date when resources will be terminated, including the grace period.',
              )}
              value={renderFieldOrDash(project.effective_end_date)}
            />
          )}

          <MarkdownEditField
            name="description"
            label={translate('Description')}
          />

          {ENV.plugins.WALDUR_CORE.ENABLE_PROJECT_KIND_COURSE && (
            <SelectEditField
              name="kind"
              label={translate('Project kind')}
              options={Object.values(projectKindOptions())}
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
              simpleValue
              required
            />
          )}

          <NumberEditField
            name="max_service_accounts"
            label={translate('Maximum number of service accounts')}
            description={translate(
              'The maximum number of service accounts that can be created in this project.',
            )}
            min={0}
            isStaffOnly
          />

          <BooleanEditField
            name="display_credit_reports"
            label={translate('Credit reports')}
            description={translate(
              'Show credit burn-down and usage analytics on this project dashboard.',
            )}
            isStaffOnly
          />
        </FormTable>
      </FormTable.Card>
    </EditFieldProvider>
  );
};
