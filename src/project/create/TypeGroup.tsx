import { useQuery } from '@tanstack/react-query';
import { Field } from 'react-final-form';
import { projectTypesList } from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

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
    staleTime: 5 * 60 * 1000,
  });
  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3 className="text-center">
      {translate('Unable to load project types.')}
    </h3>
  ) : projectTypes.length >= 1 ? (
    <FormGroup label={translate('Project type')}>
      <Field
        component={SelectField}
        name="type"
        options={projectTypes}
        getOptionValue={(option) => option.url}
        getOptionLabel={(option) => option.name}
        isClearable={true}
      />
    </FormGroup>
  ) : null;
};
