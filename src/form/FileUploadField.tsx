import { UploadSimpleIcon } from '@phosphor-icons/react';
import accepts from 'attr-accept';
import { ReactNode, useRef, useState } from 'react';

import { BaseButton, ButtonVariant, ButtonSize } from 'waldur-ui';

import { translate } from '@/i18n';

import { FormField } from './types';

export interface FileUploadFieldProps extends FormField {
  accept?: string;
  showFileName?: boolean;
  buttonLabel: string;
  iconNode?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export const FileUploadField = ({
  accept,
  showFileName,
  buttonLabel,
  variant = 'primary',
  size = 'sm',
  className,
  disabled,
  input,
  iconNode = <UploadSimpleIcon weight="bold" />,
}: FileUploadFieldProps) => {
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length === 1) {
      const file = files[0];
      if (
        !accept ||
        accepts(
          {
            type: file.type,
            name: file.name,
          },
          accept,
        )
      ) {
        setFileName(file.name);
        input.onChange(file);
        return;
      }
    }
    setFileName(undefined);
    input.onChange(null);
  };

  return (
    <>
      {showFileName ? fileName || 'None' : null}{' '}
      <BaseButton
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={openFileDialog}
        disabled={disabled}
        disabledReason={translate('This field is disabled')}
        iconNode={iconNode}
        label={buttonLabel}
      />
      <input
        type="file"
        style={{ display: 'none' }}
        ref={fileInputRef}
        accept={accept}
        onChange={handleFile}
        disabled={disabled}
        data-testid="upload"
      />
    </>
  );
};
