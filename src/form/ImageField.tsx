import {
  UploadSimpleIcon,
  ImageIcon,
  ArrowsClockwiseIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent, useCallback, useEffect, useRef } from 'react';

import { translate } from '@waldur/i18n';

import { FormField } from './types';

import './ImageField.scss';

type ImageType = File | string;

interface ImageFieldProps extends FormField {
  size?: number;
  initialValue?: ImageType;
}

const style = {
  height: 'auto',
  width: '100%',
  maxHeight: '100%',
  maxWidth: '100%',
};

const previewImage = (imageFile: ImageType, element: HTMLImageElement) => {
  if (!imageFile || !element) {
    return;
  }
  if (typeof imageFile === 'string') {
    element.src = imageFile;
  } else if (imageFile instanceof File) {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      // @ts-ignore
      element.src = fileReader.result;
    };
    fileReader.readAsDataURL(imageFile);
  }
};

export const ImageField: FunctionComponent<ImageFieldProps> = (props) => {
  const { input, initialValue } = props;
  const inputRef = useRef<HTMLInputElement>();
  const previewRef = useRef<HTMLImageElement>();

  const changeImage = useCallback(
    (imageFile: ImageType) => {
      input.onChange && input.onChange(imageFile);
      previewImage(imageFile, previewRef.current);
      if (!imageFile && inputRef.current) {
        inputRef.current.value = null;
      }
    },
    [previewRef, input],
  );

  useEffect(() => {
    previewImage(input.value, previewRef.current);
  }, [input.value, previewRef]);

  // Reset input on changing initial value
  useEffect(() => {
    changeImage(initialValue);
  }, [initialValue]);

  const isChanged = Boolean(
    input.value instanceof File ||
      Boolean(input.value) !== Boolean(initialValue),
  );

  return (
    <div
      className={classNames('image-input image-input-outline', {
        'image-input-empty': !input.value,
        'image-input-changed': isChanged,
      })}
      data-kt-image-input="true"
    >
      <div className="imagefield-upload-row">
        <div className="imagefield-avatar-box">
          {!input.value ? (
            <ImageIcon size={32} color="forestgreen" />
          ) : (
            <img style={style} ref={previewRef} alt="preview" />
          )}
        </div>
        <div className="imagefield-upload-info">
          <div className="imagefield-upload-desc">
            {translate('Upload an image')} JPG {translate('or')} PNG,{' '}
            {translate('under 2 MB')}
          </div>
          <label
            className="btn btn-outline btn-outline-default d-inline-flex align-items-center gap-2"
            data-kt-image-input-action="change"
          >
            {input.value ? (
              <>
                <span>{translate('Replace')}</span>
                <ArrowsClockwiseIcon size={20} />
              </>
            ) : (
              <>
                <UploadSimpleIcon size={20} />
                <span>{translate('Upload')}</span>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              name={input.name}
              accept=".png, .jpg, .jpeg"
              onChange={(event) => changeImage(event.target.files[0])}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
