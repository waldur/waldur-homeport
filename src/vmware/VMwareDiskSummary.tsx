import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

export const VMwareDiskSummary = (props) => {
  const { resource } = props;
  return (
    <PropertyItem
      label={translate('Size')}
      value={propVal.fileSize(resource.size, { unit: 'MB' })}
    />
  );
};
