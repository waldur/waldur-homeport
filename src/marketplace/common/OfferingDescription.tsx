import { FormattedHtml } from '@waldur/core/FormattedHtml';

export const OfferingDescription = ({ offering }) => {
  const description = offering.description || offering.parent_description;
  return description ? (
    <div className="offering-description text-gray-700 fs-7">
      <FormattedHtml html={description} />
    </div>
  ) : null;
};
