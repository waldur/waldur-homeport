import { TrashIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { FileUploadField } from '@/form';
import { FileUploadFieldProps } from '@/form/FileUploadField';
import { withFormGroup } from '@/form/withFormGroup';
import { translate } from '@/i18n';

const getImageUrl = (image) => {
  if (image instanceof File) {
    return URL.createObjectURL(image);
  }
  if (typeof image === 'string') {
    return image;
  }
  return '';
};

const ImageUploadField: FunctionComponent<FileUploadFieldProps> = (props) => {
  if (!props.input.value) {
    return <FileUploadField {...props} />;
  }
  return (
    <div style={{ maxHeight: 200, maxWidth: 200 }}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-5">
        <div className="md:col-span-5">
          <div>
            <img
              src={getImageUrl(props.input.value)}
              alt={translate('Image here')}
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
        <div className="md:col-span-7">
          <div>
            <FileUploadField
              variant="primary"
              size="sm"
              className="mb-1.5"
              {...props}
            />
          </div>
          {props.input.value && (
            <BaseButton
              variant="danger"
              size="sm"
              className="mb-1.5"
              label={translate('Remove')}
              onClick={() => props.input.onChange(null)}
              iconNode={<TrashIcon weight="bold" />}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const ImageUploadGroup = withFormGroup(ImageUploadField);
