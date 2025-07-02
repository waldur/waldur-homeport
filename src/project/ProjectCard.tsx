import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { Project } from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { ModelCard1 } from '@waldur/core/ModelCard1';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getUser } from '@waldur/workspace/selectors';

import { ProjectLink } from './ProjectLink';
import { canEditProject } from './utils';

interface ProjectCardProps {
  project: Project;
  onClickDetails?(row): void;
}

export const ProjectCard: FunctionComponent<ProjectCardProps> = ({
  project,
  onClickDetails,
}) => {
  const user = useSelector(getUser);
  const canEdit = canEditProject(user, {
    customer: { uuid: project.customer_uuid },
    project,
  });
  return (
    <ProjectLink
      row={project}
      showIndustry={false}
      onClick={() => onClickDetails(project)}
    >
      <ModelCard1
        title={project.name}
        ellipsisLines={2}
        logo={project.image}
        clickable
        body={
          <div className="fs-6">
            <Field
              label={translate('Organization')}
              value={project.customer_name}
              space={2}
              labelCol={6}
              valueCol={6}
              valueClass="ellipsis"
            />

            <Field
              label={translate('Resources')}
              value={renderFieldOrDash(project.resources_count)}
              space={2}
              labelCol={6}
              valueCol={6}
            />

            <Field
              label={
                project.start_date && project.end_date
                  ? translate('Start-end date')
                  : project.start_date
                    ? translate('Start date')
                    : translate('End date')
              }
              value={
                [
                  project.start_date && formatDate(project.start_date),
                  project.end_date && formatDate(project.end_date),
                ]
                  .filter(Boolean)
                  .join('-') || DASH_ESCAPE_CODE
              }
              space={2}
              labelCol={6}
              valueCol={6}
            />

            <Field
              label={translate('Cost estimation')}
              value={defaultCurrency(
                (project.billing_price_estimate &&
                  project.billing_price_estimate.total) ||
                  0,
              )}
              space={2}
              labelCol={6}
              valueCol={6}
            />

            {(project.project_credit || project.project_credit === 0) && (
              <Field
                label={translate('Remaining credit')}
                value={renderFieldOrDash(
                  defaultCurrency(project.project_credit),
                )}
                space={2}
                labelCol={6}
                valueCol={6}
              />
            )}
          </div>
        }
        footer={
          <div className="d-flex justify-content-end align-items-center gap-2">
            {canEdit && (
              <Link
                state="project-manage"
                params={{ uuid: project.uuid }}
                className="btn btn-text-primary btn-active-secondary btn-sm"
              >
                {translate('Edit')}
              </Link>
            )}
            <ProjectLink
              row={project}
              showIndustry={false}
              onClick={() => onClickDetails(project)}
              className="btn btn-text-primary btn-active-secondary btn-sm"
            >
              {translate('Details')}
            </ProjectLink>
          </div>
        }
      />
    </ProjectLink>
  );
};
