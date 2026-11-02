import { useRouter } from '@uirouter/react';
import { FunctionComponent, MouseEvent, useCallback } from 'react';
import { Project } from 'waldur-js-client';

import { Badge, PropertyItem, PropertyList } from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { ModelCard1 } from '@/core/ModelCard1';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
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
        <div className="text-sm">
          <PropertyList
            variant="summary"
            termWidth="sm"
            space={1.5}
            hideIfEmpty={false}
          >
            <PropertyItem
              label={translate('Organization')}
              value={project.customer_name}
              valueClass="ellipsis"
            />

            <PropertyItem
              label={translate('Resources')}
              value={propVal.number(project.resources_count)}
            />

            <PropertyItem
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
                    className="inline-flex items-center flex-wrap gap-1"
                    onClick={stopPropagation}
                  >
                    {renderFieldOrDash(
                      [
                        project.start_date && formatDate(project.start_date),
                        project.end_date && formatDate(project.end_date),
                      ]
                        .filter(Boolean)
                        .join('-'),
                    )}
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
                        shape="pill"
                        tone="outline"
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
            />

            {!shouldConcealPrices && (
              <>
                <PropertyItem
                  label={translate('Cost estimation')}
                  value={propVal.currency(
                    project.billing_price_estimate
                      ? project.billing_price_estimate.total || 0
                      : null,
                  )}
                />

                <PropertyItem
                  label={translate('Remaining credit')}
                  value={propVal.currency(project.project_credit)}
                  hideIfEmpty
                />
              </>
            )}
          </PropertyList>
        </div>
      }
      footer={
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          className="flex justify-end items-center gap-1.5"
          onClick={stopPropagation}
        >
          {canEdit && (
            <Link
              state="project-manage"
              params={{ uuid: project.uuid }}
              buttonVariant="text-primary"
              buttonSize="sm"
            >
              {translate('Edit')}
            </Link>
          )}
          <ProjectLink
            row={project}
            showIndustry={false}
            onClick={() => onClickDetails?.(project)}
            buttonVariant="text-primary"
            buttonSize="sm"
          >
            {translate('Details')}
          </ProjectLink>
        </div>
      }
    />
  );
};
