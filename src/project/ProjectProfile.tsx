import {
  CircleIcon,
  FactoryIcon,
  GlobeSimpleIcon,
  GraduationCapIcon,
} from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Stack } from 'react-bootstrap';
import { Project } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { PublicDashboardHero } from '@/dashboard/hero/PublicDashboardHero';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { getItemAbbreviation } from '@/navigation/workspace/context-selector/utils';
import { useUser, useCustomer } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import { ProjectActions } from './dashboard/ProjectActions';

interface ProjectProfileProps {
  project: Project;
}

const HeroTitle = ({ project }: ProjectProfileProps) => {
  const user = useUser();
  const customer = useCustomer();
  const isOwnerOrStaff = checkIsOwnerOrStaff(customer, user);
  return (
    <div>
      <h3 className="mb-1 flex items-center flex-wrap">
        {isFeatureVisible(ProjectFeatures.show_industry_flag) &&
          project.is_industry && (
            <FactoryIcon
              size={18}
              weight="bold"
              className="me-2.5 text-quaternary"
            />
          )}
        <span>{project.name}</span>
        {project.kind === 'course' ? (
          <Badge
            variant="pink"
            shape="pill"
            tone="outline"
            className="ms-1.5 whitespace-nowrap"
          >
            {translate('Course')}
          </Badge>
        ) : project.kind === 'public' ? (
          <Badge
            variant="blue"
            shape="pill"
            tone="outline"
            className="ms-1.5 whitespace-nowrap"
          >
            {translate('Public')}
          </Badge>
        ) : null}
      </h3>

      {isOwnerOrStaff ? (
        <Link
          state="organization.dashboard"
          params={{ uuid: project.customer_uuid }}
          label={project.customer_name}
        />
      ) : (
        <i>{project.customer_name}</i>
      )}
    </div>
  );
};

const ProjectKindCard = ({ project }: ProjectProfileProps) => {
  return (
    <div className="flex gap-5.5 -ms-1.5">
      <div className="border rounded size-10 flex items-center justify-center shrink-0 text-tertiary">
        {project.kind === 'course' ? (
          <GraduationCapIcon size={20} weight="bold" />
        ) : project.kind === 'public' ? (
          <GlobeSimpleIcon size={20} weight="bold" />
        ) : (
          <CircleIcon size={20} weight="bold" />
        )}
      </div>
      <div>
        <h6 className="font-medium">
          {project.kind === 'course'
            ? translate('This is project course type')
            : project.kind === 'public'
              ? translate('This is project public type')
              : 'N/A'}
        </h6>
        <p className="text-sm text-quaternary">
          {project.kind === 'course'
            ? translate(
                'This course project enables creation of short-lived course accounts.',
              )
            : project.kind === 'public'
              ? translate(
                  'Public projects are visible to anonymous users and allow membership applications.',
                )
              : 'N/A'}
        </p>
      </div>
    </div>
  );
};

const APPROACHING_DAYS = 30;

const ProjectEndDate = ({ project }: ProjectProfileProps) => {
  const today = new Date();
  const endDateObj = new Date(project.end_date);
  const effectiveEndDateObj = project.effective_end_date
    ? new Date(project.effective_end_date)
    : endDateObj;
  const daysToEnd = Math.ceil(
    (endDateObj.getTime() - today.getTime()) / 86400000,
  );
  const daysSinceEffectiveEnd = Math.floor(
    (today.getTime() - effectiveEndDateObj.getTime()) / 86400000,
  );

  let className = '';
  let suffix: string | null = null;
  if (project.is_in_grace_period) {
    className = 'text-warning';
    const daysLeft = Math.max(
      0,
      Math.ceil((effectiveEndDateObj.getTime() - today.getTime()) / 86400000),
    );
    suffix = translate('(in grace period, {n} days left)', {
      n: String(daysLeft),
    });
  } else if (daysSinceEffectiveEnd > 0) {
    className = 'text-danger';
    suffix = translate('(expired {n} days ago)', {
      n: String(daysSinceEffectiveEnd),
    });
  } else if (daysToEnd >= 0 && daysToEnd <= APPROACHING_DAYS) {
    className = 'text-warning';
    suffix =
      daysToEnd === 0
        ? translate('(today)')
        : translate('(in {n} days)', { n: String(daysToEnd) });
  }

  return (
    <span className={className || undefined}>
      {translate('End date:')} {formatDate(project.end_date)}
      {suffix && <span className="ms-1">{suffix}</span>}
    </span>
  );
};

export const ProjectProfile = ({ project }: ProjectProfileProps) => {
  const abbreviation = useMemo(() => getItemAbbreviation(project), [project]);

  return (
    <PublicDashboardHero
      hideQuickSection={!['public', 'course'].includes(project.kind)}
      logo={project.image}
      logoAlt={abbreviation}
      logoCircle
      cardBordered
      title={<HeroTitle project={project} />}
      mobileBottomActions
      quickBody={
        ['public', 'course'].includes(project.kind) && (
          <ProjectKindCard project={project} />
        )
      }
      actions={<ProjectActions project={project} />}
    >
      <Stack direction="horizontal" className="gap-5 mb-1">
        {project.oecd_fos_2007_code && (
          <span>{`${project.oecd_fos_2007_code}. ${project.oecd_fos_2007_label}`}</span>
        )}
        {project.type && <span>{project.type}</span>}
        {project.start_date && (
          <span>
            {translate('Start date:')} {formatDate(project.start_date)}
          </span>
        )}
        {project.end_date && <ProjectEndDate project={project} />}
      </Stack>
    </PublicDashboardHero>
  );
};
