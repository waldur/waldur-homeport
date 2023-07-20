import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';

export const ResourceTitle = ({ resource }) => (
  <div className="d-flex align-items-center">
    <h4 className="text-start mb-0 me-2">{resource.name}</h4>
    <CopyToClipboardButton
      value={resource.name}
      size="sm"
      className="mx-2 text-hover-primary cursor-pointer"
    />
  </div>
);
