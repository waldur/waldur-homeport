import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { Project } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { Link } from '@/core/Link';
import { ModelCard1 } from '@/core/ModelCard1';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { renderFieldOrDash } from '@/table/utils';
import { getUser } from '@/workspace/selectors';

import { ChangeEndDateCardButton } from './ChangeEndDateCardButton';
import { ProjectLifecycleBadge } from './ProjectLifecycleBadge';
import { ProjectLink } from './ProjectLink';
import { canEditProject } from './utils';

interface ProjectCardProps {
  project: Project;
  onClickDetails?(row): void;
  refetch?: () => void;
}

export const ProjectCard: FunctionComponent<ProjectCardProps> = ({
  project,
  onClickDetails,
  refetch = () => {},
}) => {
  const user = useSelector(getUser);
  const shouldConcealPrices =
    isFeatureVisible(MarketplaceFeatures.conceal_prices) ||
    project.customer_display_billing_info_in_projects === false;
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
                <>
                  <span className="d-inline-flex align-items-center flex-wrap gap-1">
                    {[
                      project.start_date && formatDate(project.start_date),
                      project.end_date && formatDate(project.end_date),
                    ]
                      .filter(Boolean)
                      .join('-') || DASH_ESCAPE_CODE}
                    <ChangeEndDateCardButton
                      project={project}
                      refetch={refetch}
                    />
                  </span>
                  {project.end_date &&
                    project.grace_period_days > 0 &&
                    !project.is_in_grace_period &&
                    (!project.effective_end_date ||
                      new Date(project.effective_end_date) >= new Date()) && (
                      <Badge
                        variant="secondary"
                        size="sm"
                        pill
                        outline
                        className="ms-1"
                      >
                        {translate('+{count}d grace', {
                          count: project.grace_period_days,
                        })}
                      </Badge>
                    )}
                  <ProjectLifecycleBadge project={project} className="ms-1" />
                </>
              }
              space={2}
              labelCol={6}
              valueCol={6}
            />

            {!shouldConcealPrices && (
              <>
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
              </>
            )}
          </div>
        }
        footer={
          <div className="d-flex justify-content-end align-items-center gap-2">
            {canEdit && (
              <Link
                state="project-manage"
                params={{ uuid: project.uuid }}
                buttonVariant="text-primary"
                className="btn-sm"
              >
                {translate('Edit')}
              </Link>
            )}
            <ProjectLink
              row={project}
              showIndustry={false}
              onClick={() => onClickDetails(project)}
              buttonVariant="text-primary"
              className="btn-sm"
            >
              {translate('Details')}
            </ProjectLink>
          </div>
        }
      />
    </ProjectLink>
  );
};
