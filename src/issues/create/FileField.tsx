import * as React from 'react';
import Button from 'react-bootstrap/lib/Button';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

const FileListComponent = ({ files }) =>
  files instanceof FileList && files.length > 0 ? (
    <ul>
      {Array.from(files).map((file, index) => (
        <li key={index}>
          {translate('{name} ({size})', {
            name: file.name,
            size: formatFilesize(file.size, 'B'),
          })}
        </li>
      ))}
    </ul>
  ) : null;

export const FileField = ({ input, disabled }) => {
  const fileInput = React.useRef<HTMLInputElement>();
  return (
    <div>
      <input
        type="file"
        ref={fileInput}
        multiple={true}
        style={{ display: 'none' }}
        onChange={input.onChange}
      />
      <Button
        disabled={disabled}
        onClick={() => {
          fileInput.current.click();
        }}
      >
        {translate('Select some files')}
      </Button>
      <FileListComponent files={input.value} />
    </div>
  );
};
