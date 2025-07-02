import { FactoryIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Project } from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { isOwnerOrStaff as isOwnerOrStaffSelector } from '@waldur/workspace/selectors';

export const ProjectProfile = ({ project }: { project: Project }) => {
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const abbreviation = useMemo(() => getItemAbbreviation(project), [project]);

  return (
    <PublicDashboardHero
      hideQuickSection
      logo={project.image}
      logoAlt={abbreviation}
      logoCircle
      cardBordered
      title={
        <div>
          <h3 className="mb-1">
            {isFeatureVisible(ProjectFeatures.show_industry_flag) &&
              project.is_industry && (
                <span className="svg-icon svg-icon-3 me-3">
                  <FactoryIcon />
                </span>
              )}
            {project.name}
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
      }
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
