import { useRouter } from '@uirouter/react';
import { FunctionComponent, MouseEvent, useCallback } from 'react';
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
import { useUser } from '@/workspace/hooks';

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
  const user = useUser();
  const router = useRouter();
  const shouldConcealPrices =
    isFeatureVisible(MarketplaceFeatures.conceal_prices) ||
    project.customer_display_billing_info_in_projects === false;
  const canEdit = canEditProject(user, {
    customer: { uuid: project.customer_uuid },
    project,
  });

  // The card navigates via onClick instead of wrapping everything in an
  // anchor: the footer holds its own links, and nesting <a> inside <a>
  // is invalid DOM (same pattern as OrganizationCard).
  const handleCardClick = useCallback(() => {
    onClickDetails?.(project);
    router.stateService.go('project.dashboard', {
      uuid: project.uuid,
      ...(project.is_removed && { include_terminated: 'true' }),
    });
  }, [onClickDetails, project, router]);

  const stopPropagation = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <ModelCard1
      title={project.name}
      ellipsisLines={2}
      logo={project.image}
      clickable
      onClick={handleCardClick}
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
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <span
                  className="d-inline-flex align-items-center flex-wrap gap-1"
                  onClick={stopPropagation}
                >
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
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          className="d-flex justify-content-end align-items-center gap-2"
          onClick={stopPropagation}
        >
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
            onClick={() => onClickDetails?.(project)}
            buttonVariant="text-primary"
            className="btn-sm"
          >
            {translate('Details')}
          </ProjectLink>
        </div>
      }
    />
  );
};
