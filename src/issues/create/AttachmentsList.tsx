import * as React from 'react';

export const AttachmentsList = ({ attachments }) => (
  <ul className="list-unstyled">
    {attachments.map((attachment, index) => (
      <li key={index}>
        <a href={attachment.file} target="_blank" rel="noopener noreferrer">
          <i className="fa fa-cloud-download" /> {attachment.name}
        </a>
      </li>
    ))}
  </ul>
);
