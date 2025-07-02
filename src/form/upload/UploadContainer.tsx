import { CloudArrowUpIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useRef } from 'react';
import Dropzone, { DropzoneOptions, DropzoneRef } from 'react-dropzone';

import { formatJsx, translate } from '@waldur/i18n';

import './UploadContainer.scss';

interface UploadContainerProps extends DropzoneOptions {
  message?: string;
  className?: string;
}

const rejectStyle = {
  borderColor: '#ff1744',
};

export const UploadContainer: React.FC<UploadContainerProps> = (props) => {
  const { message, className, ...rest } = props;
  const dropzoneNode = useRef<DropzoneRef>(null);

  const chooseFile = () => {
    if (dropzoneNode.current) {
      dropzoneNode.current.open();
    }
  };

  return (
    <Dropzone noClick ref={dropzoneNode} {...rest}>
      {({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
        <div
          {...getRootProps({
            className: classNames('dropzone metronic-upload', className),
          })}
        >
          {isDragActive && (
            <div
              className="dropzone__overlay"
              style={isDragReject ? rejectStyle : undefined}
            >
              <div
                className="dropzone__overlay-message"
                style={isDragReject ? rejectStyle : undefined}
              >
                {isDragReject
                  ? translate('Invalid files')
                  : translate('Drop files to attach them.')}
              </div>
            </div>
          )}
          <div className="dropzone-message text-muted">
            <input {...getInputProps()} />
            <button
              type="button"
              className="icon"
              aria-hidden="true"
              onClick={chooseFile}
            >
              <CloudArrowUpIcon
                size={20}
                weight="bold"
                className="text-primary"
              />
            </button>
            <div>
              {translate(
                '<button>Click to upload</button> or drag and drop',
                {
                  button: (child) => (
                    <button
                      className="text-anchor fw-bold"
                      type="button"
                      onClick={chooseFile}
                    >
                      {child}
                    </button>
                  ),
                },
                formatJsx,
              )}
              <div className="fs-7 mt-1">{message}</div>
            </div>
          </div>
        </div>
      )}
    </Dropzone>
  );
};
