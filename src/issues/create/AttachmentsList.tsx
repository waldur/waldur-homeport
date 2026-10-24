import { CloudArrowDownIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { FileDownloader } from '@/form/upload/FileDownloader';

// Template files are served by the media endpoint, which needs the API token.
// A plain link opens the URL without it and gets a 404, so download through
// the authenticated client instead.
export const AttachmentsList: FunctionComponent<{ attachments }> = ({
  attachments,
}) => (
  <ul className="list-unstyled">
    {attachments.map((attachment, index) => (
      <li key={index}>
        <FileDownloader
          url={attachment.file}
          name={attachment.name}
          className="text-btn hover:text-brand inline-flex items-center gap-2"
        >
          <CloudArrowDownIcon size={20} weight="bold" />
          {attachment.name}
        </FileDownloader>
      </li>
    ))}
  </ul>
);
