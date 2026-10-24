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

// react-select reads `getOptionLabel` as the option's text, which its live
// region announces, so the industry flag is drawn in `formatOptionLabel`.
const getOptionLabel = (option) => option.name;

const formatOptionLabel = (option) => (
  <div>
    {option.name}
    {isFeatureVisible(ProjectFeatures.show_industry_flag) &&
      option.is_industry && (
        <FactoryIcon
          size={18}
          weight="bold"
          className="ms-3 inline-block text-quaternary"
        />
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
      formatOptionLabel={formatOptionLabel}
      {...props}
    />
  );
};
