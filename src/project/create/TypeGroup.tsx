import { useQuery } from '@tanstack/react-query';
import { projectTypesList } from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';

export const TypeGroup = ({ create }: { create?: boolean }) => {
  if (create && !isFeatureVisible(ProjectFeatures.show_type_in_create_dialog)) {
    return null;
  }
  const {
    isLoading: loading,
    error,
    data: projectTypes,
  } = useQuery({
    queryKey: ['projectTypes'],
    queryFn: async () => (await projectTypesList()).data,
    staleTime: STALE_TIME,
  });
  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3 className="text-center">
      {translate('Unable to load project types.')}
    </h3>
  ) : projectTypes.length >= 1 ? (
    <SelectGroup
      name="type"
      options={projectTypes}
      getOptionValue={(option) => option.url}
      getOptionLabel={(option) => option.name}
      isClearable={true}
      label={translate('Project type')}
    />
  ) : null;
};
