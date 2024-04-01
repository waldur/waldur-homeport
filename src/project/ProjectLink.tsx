import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';

export const ProjectLink = ({ row }) => (
  <div>
    <Link
      state="project.dashboard"
      params={{ uuid: row.uuid }}
      label={row.name}
    />
    {isFeatureVisible(ProjectFeatures.show_industry_flag) &&
      row.is_industry && (
        <span>
          <i className="fa fa-industry" style={{ marginLeft: '5px' }}></i>
        </span>
      )}
  </div>
);
