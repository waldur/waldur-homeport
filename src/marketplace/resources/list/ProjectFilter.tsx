import { FactoryIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';

import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { projectAutocomplete } from '@/marketplace/common/autocompletes';
import { AsyncSelectFilter } from '@/table';

interface ProjectFilterProps {
  customer_uuid?: string;
  [key: string]: any;
}

const getOptionLabel = (option) => (
  <div>
    {option.name}
    {isFeatureVisible(ProjectFeatures.show_industry_flag) &&
      option.is_industry && (
        <span className="svg-icon svg-icon-3 ms-3">
          <FactoryIcon weight="bold" />
        </span>
      )}
  </div>
);

export const ProjectFilter: FC<ProjectFilterProps> = ({
  customer_uuid,
  ...props
}) => {
  const loadOptions = useMemo(
    () => projectAutocomplete(customer_uuid),
    [customer_uuid],
  );

  return (
    <AsyncSelectFilter
      title={translate('Project')}
      name="project"
      badgeValue={(value) => value?.name}
      placeholder={translate('Select project...')}
      loadOptions={loadOptions}
      getOptionValue={(option) => option.uuid}
      getOptionLabel={getOptionLabel}
      {...props}
    />
  );
};
