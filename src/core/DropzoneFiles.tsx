import classNames from 'classnames';
import { FC, useMemo } from 'react';
import { DropzoneOptions, useDropzone } from 'react-dropzone';

import { translate } from '@waldur/i18n';

interface OwnProps extends DropzoneOptions {
  message?: string;
  className?: string;
}

const focusedStyle = {
  borderColor: '#2196f3',
};

const acceptStyle = {
  borderColor: '#00e676',
};

const rejectStyle = {
  borderColor: '#ff1744',
};

export const DropzoneFiles: FC<OwnProps> = (props) => {
  const { message, className, ...rest } = props;

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone(rest);

  const style = useMemo(
    () => ({
      // ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject],
  );

  return (
    <div
      {...getRootProps({ style, className: classNames('dropzone', className) })}
    >
      <div className="dropzone-message">
        <input {...getInputProps()} />
        <i className="fa fa-file" aria-hidden="true" />
        <span>{message}</span>
      </div>
      <div className="dropzone-attachments">
        {acceptedFiles.map((file, i) => (
          <button
            key={i}
            type="button"
            className="dropzone-item btn btn-icon btn-light btn-active-secondary"
            title={`${file.name} - ${file.size} bytes`}
          >
            <i className="fa fa-file fs-4"></i>
          </button>
        ))}
      </div>
    </div>
  );
};

DropzoneFiles.defaultProps = {
  message: translate('Drop files here, or click to select files'),
};
