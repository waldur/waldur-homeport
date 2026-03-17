import React, { useMemo } from 'react';
import { Project } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { parseDate } from '@waldur/core/dateUtils';
import { StaffOnlyIndicator } from '@waldur/core/StaffOnlyIndicator';
import FormTable, { FormTableItemProps } from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { renderFieldOrDash } from '@waldur/table/utils';
import { useUser } from '@waldur/workspace/hooks';

import { projectKindOptions } from '../utils';

import { FieldEditButton } from './FieldEditButton';
import { ProjectAvatar } from './ProjectAvatar';

interface ProjectGeneralProps {
  project: Project;
}

export const ProjectGeneral: React.FC<ProjectGeneralProps> = ({ project }) => {
  const user = useUser();
  const rows = useMemo(
    () =>
      (
        [
          {
            label: translate('Name'),
            key: 'name',
            value: renderFieldOrDash(project.name),
          },
          user.is_staff && {
            label: translate('Slug'),
            key: 'slug',
            value: renderFieldOrDash(project.slug),
          },
          user.is_staff && {
            label: translate('Staff notes'),
            key: 'staff_notes',
            value: renderFieldOrDash(project.staff_notes),
          },
          {
            label: translate('Owner'),
            key: 'customer_name',
            value: renderFieldOrDash(project.customer_name),
          },
          {
            label: translate('Start date'),
            description: translate(
              'Date when invitations are sent and resource orders processed.',
            ),
            key: 'start_date',
            value: renderFieldOrDash(project.start_date),
            // If date is past, disable it
            disabled: project.start_date
              ? parseDate(project.start_date) < parseDate(null)
              : false,
          },
          {
            label: translate('End date'),
            description: translate(
              'Date when termination orders are created; project is removed if resources are already terminated.',
            ),
            key: 'end_date',
            value: renderFieldOrDash(project.end_date),
          },
          {
            label: translate('Grace period (days)'),
            description: translate(
              'Number of extra days after project end date before resources are terminated. Overrides customer-level setting.',
            ),
            key: 'grace_period_days',
            value: project.grace_period_days,
          },
          project.effective_end_date &&
            project.grace_period_days > 0 && {
              label: translate('Resource termination date'),
              description: translate(
                'The actual date when resources will be terminated, including the grace period.',
              ),
              key: 'effective_end_date',
              value: renderFieldOrDash(project.effective_end_date),
            },
          {
            label: translate('Description'),
            key: 'description',
            value: renderFieldOrDash(project.description),
          },
          ENV.plugins.WALDUR_CORE.ENABLE_PROJECT_KIND_COURSE && {
            label: translate('Project kind'),
            key: 'kind',
            value: renderFieldOrDash(
              (
                projectKindOptions()[project.kind] ||
                projectKindOptions().default
              )?.label,
            ),
          },
          user.is_staff && {
            label: translate('Maximum number of service accounts'),
            description: translate(
              'The maximum number of service accounts that can be created in this project.',
            ),
            key: 'max_service_accounts',
            value: renderFieldOrDash(project.max_service_accounts),
          },
        ] satisfies Array<{ key: string } & FormTableItemProps>
      ).filter(Boolean),
    [project],
  );

  return (
    <>
      <ProjectAvatar project={project} />

      <FormTable.Card title={translate('Details')} className="card-bordered">
        <FormTable>
          {rows.map((row) => {
            const isStaffOnlyEditField = [
              'grace_period_days',
              'slug',
              'staff_notes',
              'max_service_accounts',
            ].includes(row.key);
            const isReadOnlyField = row.key === 'effective_end_date';

            return (
              <FormTable.Item
                key={row.key}
                label={row.label}
                description={row.description}
                value={row.value}
                actions={
                  isReadOnlyField ? null : (
                    <>
                      {isStaffOnlyEditField && <StaffOnlyIndicator />}
                      {(!isStaffOnlyEditField || user.is_staff) && (
                        <FieldEditButton
                          project={project}
                          name={row.key}
                          disabled={row.disabled}
                        />
                      )}
                    </>
                  )
                }
              />
            );
          })}
        </FormTable>
      </FormTable.Card>
    </>
  );
};
