import { FactoryIcon } from '@phosphor-icons/react';
import { FC, PropsWithChildren } from 'react';
import { Project } from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { AtLeast } from '@waldur/core/types';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';

interface OwnProps {
  row: AtLeast<Project, 'uuid' | 'name'>;
  className?: string;
  showIndustry?: boolean;
  onClick?(): void;
}

export const ProjectLink: FC<PropsWithChildren<OwnProps>> = ({
  row,
  className,
  children,
  showIndustry = true,
  onClick,
}) => (
  <>
    <Link
      state="project.dashboard"
      params={{ uuid: row.uuid }}
      label={children ? undefined : row.name}
      onClick={onClick}
      className={className}
    >
      {children}
    </Link>
    {showIndustry &&
      isFeatureVisible(ProjectFeatures.show_industry_flag) &&
      row.is_industry && (
        <span className="svg-icon svg-icon-4 ms-3">
          <FactoryIcon />
        </span>
      )}
  </>
);
