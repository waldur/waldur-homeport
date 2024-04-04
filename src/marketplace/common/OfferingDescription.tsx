import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';

export const OfferingDescription = ({ offering }) => {
  const description = offering.description || offering.parent_description;
  return description ? (
    <div className="offering-description text-gray-700 fs-7">
      <FormattedHtml html={description} />
    </div>
  ) : (
    <p className="text-muted fst-italic fs-7">
      {translate('There is no description')}
    </p>
  );
};
