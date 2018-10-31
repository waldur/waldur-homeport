import * as React from 'react';

import { FileUploadField } from '@waldur/form-react';
import { FileUploadFieldProps } from '@waldur/form-react/FileUploadField';

import { translate } from '@waldur/i18n';
import ActionButton from '@waldur/table-react/ActionButton';

import './ImageUploadField.scss';

const getImageUrl = image => {
  if (image instanceof File) {
    return URL.createObjectURL(image);
  }
  if (typeof image === 'string') {
    return image;
  }
  return '';
};

interface ImageUploadFieldProps extends FileUploadFieldProps {
  image: HTMLImageElement;
  onImageRemove?(): void;
}

export const ImageUploadField = ({image, ...props}: ImageUploadFieldProps) => {
  return image ? (
    <div className="image-upload-field">
      <div className="row">
        <div className="col-md-5">
          <div className="image">
            <img src={getImageUrl(image)} alt="Image here"/>
          </div>
        </div>
        <div className="col-md-7">
          <div className="image-actions">
            <div>
              <FileUploadField className="btn btn-sm btn-primary m-b-sm" {...props}/>
            </div>
            {image &&
              <ActionButton
                className="btn btn-sm btn-danger m-b-sm"
                title={translate('Remove')}
                action={props.onImageRemove}
                icon="fa fa-trash"
              />
            }
          </div>
        </div>
      </div>
    </div>
    ) : <FileUploadField {...props} />;
};
