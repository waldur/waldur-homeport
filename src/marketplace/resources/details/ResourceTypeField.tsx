import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { formatResourceType } from '@waldur/resource/utils';

export const ResourceTypeField = ({ resource }) => {
  return (
    <Field
      label={translate('Resource type')}
      value={formatResourceType(resource)}
    />
  );
};
