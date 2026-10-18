import { CloudArrowUpIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useRef } from 'react';
import Dropzone, { DropzoneOptions, DropzoneRef } from 'react-dropzone';

import { formatJsx, translate } from '@/i18n';
import { useTheme } from '@/theme/useTheme';

import './UploadContainer.scss';

interface UploadContainerProps extends DropzoneOptions {
  message?: string;
  /** Accessible name of the file input; defaults to "Upload files". */
  inputLabel?: string;
  className?: string;
  disabled?: boolean;
}

const rejectStyleLight = {
  borderColor: '#fda29b',
};

const rejectStyleDark = {
  borderColor: '#f97066',
};

export const UploadContainer: React.FC<UploadContainerProps> = (props) => {
  const { message, className, inputLabel, ...rest } = props;
  const dropzoneNode = useRef<DropzoneRef>(null);

  const { theme } = useTheme();
  const rejectStyle = theme === 'dark' ? rejectStyleDark : rejectStyleLight;

  const chooseFile = () => {
    if (dropzoneNode.current) {
      dropzoneNode.current.open();
    }
  };

  return (
    <Dropzone noClick ref={dropzoneNode} disabled={props.disabled} {...rest}>
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
          <div className="dropzone-message text-quaternary">
            {/* Hidden by react-dropzone but still reachable by assistive
                technology and by tests that set files on it, so it is
                named. */}
            <input
              {...getInputProps()}
              aria-label={inputLabel ?? translate('Upload files')}
              data-testid="file-uploader"
            />
            {/* A mouse shortcut beside the "Click to upload" button, which
                is the one keyboard and screen-reader users get. */}
            <button
              type="button"
              className="icon-square"
              aria-hidden="true"
              tabIndex={-1}
              onClick={chooseFile}
            >
              <CloudArrowUpIcon size={16} weight="bold" />
            </button>
            <div>
              {translate(
                '<button>Click to upload</button> or drag and drop',
                {
                  button: (child) => (
                    <button
                      className="text-anchor font-medium"
                      type="button"
                      onClick={chooseFile}
                      disabled={rest.disabled}
                    >
                      {child}
                    </button>
                  ),
                },
                formatJsx,
              )}
              <div className="text-xs mt-1">{message}</div>
            </div>
          </div>
        </div>
      )}
    </Dropzone>
  );
};
