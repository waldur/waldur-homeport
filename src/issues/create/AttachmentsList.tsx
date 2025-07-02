import { CloudArrowDownIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

export const AttachmentsList: FunctionComponent<{ attachments }> = ({
  attachments,
}) => (
  <ul className="list-unstyled">
    {attachments.map((attachment, index) => (
      <li key={index}>
        <a href={attachment.file} target="_blank" rel="noopener noreferrer">
          <span className="svg-icon svg-icon-2">
            <CloudArrowDownIcon />
          </span>{' '}
          {attachment.name}
        </a>
      </li>
    ))}
  </ul>
);
