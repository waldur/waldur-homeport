import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Field, ResourceSummaryBase } from '@waldur/resource/summary';

export const VMwareDiskSummary = (props) => {
  const { resource } = props;
  return (
    <>
      <ResourceSummaryBase {...props} />
      <Field label={translate('Size')} value={formatFilesize(resource.size)} />
    </>
  );
};
