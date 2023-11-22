import classNames from 'classnames';
import { FunctionComponent, useCallback, useEffect, useRef } from 'react';

import { Tip } from '@waldur/core/Tooltip';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import { FormField } from './types';

import './ImageField.scss';

const avatarBlank = require('@waldur/images/avatar-blank.svg');

type ImageType = File | string;

interface ImageFieldProps extends FormField {
  size?: number;
  initialValue?: ImageType;
}

const previewImage = (
  imageFile: ImageType,
  element: HTMLElement,
  size: number,
) => {
  if (!imageFile) {
    element.style.backgroundImage = 'none';
    return;
  }

  const imageElement = new Image();

  if (typeof imageFile === 'string') {
    imageElement.src = imageFile;
  } else if (imageFile instanceof File) {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      imageElement.src = fileReader.result as string;
    };

    fileReader.readAsDataURL(imageFile);
  }

  imageElement.onload = () => {
    const aspectRatio = imageElement.width / size;

    const height = imageElement.height / aspectRatio;

    element.style.backgroundImage = `url(${imageElement.src})`;
    element.style.backgroundSize = `100%`;
    element.style.height = `${height}px`;
  };
};

export const ImageField: FunctionComponent<ImageFieldProps> = (props) => {
  const { input, size, initialValue } = props;
  const inputRef = useRef<HTMLInputElement>();
  const previewRef = useRef<HTMLDivElement>();

  const changeImage = useCallback(
    (imageFile: ImageType) => {
      input.onChange && input.onChange(imageFile);
      previewImage(imageFile, previewRef.current, size);
      if (!imageFile && inputRef.current) {
        inputRef.current.value = null;
        previewRef.current.className = `image-input-wrapper w-${size}px h-${size}px`;
      }
    },
    [previewRef, input, size],
  );

  useEffect(() => {
    previewImage(input.value, previewRef.current, size);
  }, [input.value, previewRef, size]);

  // Reset input on changing initial value
  useEffect(() => {
    changeImage(initialValue);
    // eslint-disable-next-line
  }, [initialValue]);

  const isChanged = Boolean(
    input.value instanceof File ||
      Boolean(input.value) !== Boolean(initialValue),
  );

  return (
    <>
      <div
        className={classNames('image-input image-input-outline', {
          'image-input-empty': !input.value,
          'image-input-changed': isChanged,
        })}
        data-kt-image-input="true"
        style={{
          backgroundImage: `url(${avatarBlank})`,
          width: size,
          height: size,
          backgroundSize: `${size}px ${size}px`,
        }}
      >
        <div ref={previewRef} className="image-input-wrapper"></div>

        {/* Pick image */}
        <label
          className="btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-25px h-25px bg-body shadow"
          data-kt-image-input-action="change"
        >
          <Tip
            id="image-input-edit"
            label={translate('Change avatar')}
            className="w-100"
          >
            <i className="fa fa-pencil fs-6" />
          </Tip>

          <input
            ref={inputRef}
            type="file"
            name={input.name}
            accept=".png, .jpg, .jpeg"
            onChange={(event) => changeImage(event.target.files[0])}
          />
        </label>

        {/* Cancel image */}
        <span
          className="btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-25px h-25px bg-body shadow"
          data-kt-image-input-action="cancel"
          onClick={() => changeImage(initialValue)}
        >
          <Tip
            id="image-input-cancel"
            label={translate('Reset avatar')}
            className="w-100"
          >
            <i className="fa fa-repeat fs-6"></i>
          </Tip>
        </span>

        {/* Remove image */}
        <span
          className="btn btn-icon btn-circle btn-color-muted btn-active-color-danger w-25px h-25px bg-body shadow"
          data-kt-image-input-action="remove"
          onClick={() => changeImage('')}
        >
          <Tip
            id="image-input-remove"
            label={translate('Remove avatar')}
            className="w-100"
          >
            <i className="fa fa-times fs-6" />
          </Tip>
        </span>
      </div>
      <div className="form-text">
        {isChanged && input.value instanceof File ? (
          <>
            {input.value.name} {formatFilesize(input.value.size, 'B')}
          </>
        ) : (
          <>{translate('Allowed file types')}: png, jpg, jpeg.</>
        )}
      </div>
    </>
  );
};

ImageField.defaultProps = {
  size: 125,
};
