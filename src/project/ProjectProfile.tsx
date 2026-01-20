import {
  CircleIcon,
  FactoryIcon,
  GlobeSimpleIcon,
  GraduationCapIcon,
} from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Project } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDate } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { isOwnerOrStaff as isOwnerOrStaffSelector } from '@waldur/workspace/selectors';

import { ProjectActions } from './dashboard/ProjectActions';

interface ProjectProfileProps {
  project: Project;
}

const HeroTitle = ({ project }: ProjectProfileProps) => {
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  return (
    <div>
      <h3 className="mb-1">
        {isFeatureVisible(ProjectFeatures.show_industry_flag) &&
          project.is_industry && (
            <span className="svg-icon svg-icon-3 me-3">
              <FactoryIcon weight="bold" />
            </span>
          )}
        {project.name}
        {project.kind === 'course' ? (
          <Badge variant="pink" pill outline className="ms-2">
            {translate('Course')}
          </Badge>
        ) : project.kind === 'public' ? (
          <Badge variant="blue" pill outline className="ms-2">
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
    <div className="d-flex gap-7 ms-n2">
      <div className="border rounded w-40px h-40px d-flex flex-center flex-shrink-0">
        <span className="svg-icon svg-icon-2 svg-icon-gray-600">
          {project.kind === 'course' ? (
            <GraduationCapIcon weight="bold" />
          ) : project.kind === 'public' ? (
            <GlobeSimpleIcon weight="bold" />
          ) : (
            <CircleIcon weight="bold" />
          )}
        </span>
      </div>
      <div>
        <h6 className="fw-bold">
          {project.kind === 'course'
            ? translate('This is project course type')
            : project.kind === 'public'
              ? translate('This is project public type')
              : 'N/A'}
        </h6>
        <p className="fs-6 text-muted">
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

export const ProjectProfile = ({ project }: ProjectProfileProps) => {
  const abbreviation = useMemo(() => getItemAbbreviation(project), [project]);

  return (
    <PublicDashboardHero
      hideQuickSection={project.kind === 'default'}
      logo={project.image}
      logoAlt={abbreviation}
      logoCircle
      cardBordered
      title={<HeroTitle project={project} />}
      quickBody={
        ['public', 'course'].includes(project.kind) && (
          <ProjectKindCard project={project} />
        )
      }
      actions={<ProjectActions project={project} />}
    >
      <Stack direction="horizontal" className="gap-6 mb-1">
        {project.oecd_fos_2007_code && (
          <span>{`${project.oecd_fos_2007_code}. ${project.oecd_fos_2007_label}`}</span>
        )}
        {project.type && <span>{project.type}</span>}
        {project.start_date && (
          <span>
            {translate('Start date:')} {formatDate(project.start_date)}
          </span>
        )}
        {project.end_date && (
          <span>
            {translate('End date:')} {formatDate(project.end_date)}
          </span>
        )}
      </Stack>
    </PublicDashboardHero>
  );
};
