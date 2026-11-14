import { CloudArrowUpIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useRef } from 'react';
import Dropzone, { DropzoneOptions, DropzoneRef } from 'react-dropzone';

import { IconSquare, LinkButton } from 'waldur-ui';

import { formatJsx, translate } from '@/i18n';

interface UploadContainerProps extends DropzoneOptions {
  message?: string;
  /** Accessible name of the file input; defaults to "Upload files". */
  inputLabel?: string;
  className?: string;
  disabled?: boolean;
}

export const UploadContainer: React.FC<UploadContainerProps> = (props) => {
  const { message, className, inputLabel, ...rest } = props;
  const dropzoneNode = useRef<DropzoneRef>(null);

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
            className: classNames(
              'relative rounded-xl border border-secondary px-6 py-4',
              className,
            ),
          })}
        >
          {isDragActive && (
            <div
              className={classNames(
                'absolute inset-0 z-2 flex items-center justify-center rounded-xl border-2 p-5 text-center',
                isDragReject ? 'border-danger-subtle' : 'border-brand-subtle',
              )}
            >
              {/* Hidden since the overlay border alone signals the drop
                  target; the text stays for assistive technology. */}
              <div
                className={classNames(
                  'hidden max-w-[250px] rounded-lg border-2 bg-primary px-7.5 py-5 text-primary',
                  isDragReject ? 'border-danger-subtle' : 'border-brand-subtle',
                )}
              >
                {isDragReject
                  ? translate('Invalid files')
                  : translate('Drop files to attach them.')}
              </div>
            </div>
          )}
          <div className="flex flex-col items-center gap-3 text-center text-sm text-quaternary">
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
            <IconSquare asChild>
              <button
                type="button"
                aria-hidden="true"
                tabIndex={-1}
                onClick={chooseFile}
              >
                <CloudArrowUpIcon size={16} weight="bold" />
              </button>
            </IconSquare>
            <div>
              {translate(
                '<button>Click to upload</button> or drag and drop',
                {
                  button: (child) => (
                    <LinkButton
                      className="font-medium"
                      onClick={chooseFile}
                      disabled={rest.disabled}
                    >
                      {child}
                    </LinkButton>
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
