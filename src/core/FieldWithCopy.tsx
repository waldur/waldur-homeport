import { renderFieldOrDash } from '@/table/utils';

import { CopyToClipboardButton } from './CopyToClipboardButton';

export const FieldWithCopy = ({ value }) => {
  return (
    <div className="d-flex justify-content-between">
      {renderFieldOrDash(value)}
      {value && ['string', 'number'].includes(typeof value) && (
        <CopyToClipboardButton
          value={value}
          size={20}
          className="mb-0 mt-0"
          buttonClassName="text-gray-500"
        />
      )}
    </div>
  );
};
