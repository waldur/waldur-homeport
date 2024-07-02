import { PencilSimple, Trash, X } from '@phosphor-icons/react';
import classNames from 'classnames';
import {
  ComponentType,
  FunctionComponent,
  createElement,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Button } from 'react-bootstrap';

import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import { FormField } from './types';
import './ImageField.scss';

type ImageType = File | string;

interface WideImageFieldProps extends FormField {
  size?: number;
  alt?: string;
  initialValue?: ImageType;
  extraActions?: ComponentType<{ value; isChanged; isTooLarge }>;
  /** max size in byte */
  max?: number;
}

const previewImage = (imageFile: ImageType, element: HTMLDivElement) => {
  if ((!imageFile && imageFile !== '') || !element) {
    return;
  }
  if (imageFile === '') {
    element.style.backgroundImage = '';
  } else if (typeof imageFile === 'string') {
    element.style.backgroundImage = `url(${imageFile})`;
  } else if (imageFile instanceof File) {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      // @ts-ignore
      element.style.backgroundImage = `url(${fileReader.result})`;
    };
    fileReader.readAsDataURL(imageFile);
  }
};

export const WideImageField: FunctionComponent<WideImageFieldProps> = (
  props,
) => {
  const { input, initialValue, size = 50, max = Infinity } = props;
  const inputRef = useRef<HTMLInputElement>();
  const previewRef = useRef<HTMLDivElement>();

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

  const isChanged = Boolean(
    input.value instanceof File ||
      Boolean(input.value) !== Boolean(initialValue),
  );

  const isTooLarge = isChanged && input.value.size > props.max;

  return (
    <div
      className={classNames(
        'image-input d-flex flex-column flex-sm-row gap-8',
        {
          'image-input-empty': !input.value,
          'image-input-changed': isChanged,
        },
      )}
    >
      <div>
        <div className={`symbol symbol-${size}px symbol-circle`}>
          {input.value ? (
            <div ref={previewRef} className="symbol-label" />
          ) : (
            <ImagePlaceholder
              width={`${size}px`}
              height={`${size}px`}
              backgroundColor="#e2e2e2"
              circle
            >
              <div className="symbol-label fs-2 fw-bold w-100 h-100">
                {props.alt}
              </div>
            </ImagePlaceholder>
          )}
        </div>
      </div>
      <div>
        <p className="text-gray-700 fs-6">
          {max !== Infinity
            ? translate('Upload an image JPG or PNG, under {maxSize}', {
                maxSize: formatFilesize(max, 'B'),
              })
            : translate('Upload an image JPG or PNG')}
        </p>
        <div className="d-flex gap-2 mb-4">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label
            className="btn btn-outline btn-outline-default btn-sm btn-icon-right"
            data-image-input-action="change"
          >
            {translate('Change')}
            <span className="svg-icon svg-icon-5">
              <PencilSimple weight="bold" />
            </span>
            <input
              ref={inputRef}
              type="file"
              name={input.name}
              accept=".png, .jpg, .jpeg"
              onChange={(event) => changeImage(event.target.files[0])}
              className="d-none"
            />
          </label>
          <Button
            variant="outline"
            size="sm"
            className="btn-outline-default btn-icon-right"
            onClick={() => changeImage(initialValue)}
            data-image-input-action="cancel"
          >
            {translate('Cancel')}
            <span className="svg-icon svg-icon-5">
              <X weight="bold" />
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="btn-outline-default btn-icon-right"
            onClick={() => changeImage('')}
            data-image-input-action="remove"
          >
            {translate('Remove')}
            <span className="svg-icon svg-icon-5">
              <Trash />
            </span>
          </Button>
          {props.extraActions
            ? createElement(props.extraActions, {
                value: input.value,
                isChanged,
                isTooLarge,
              })
            : null}
        </div>
        <div className="form-text">
          {isChanged && input.value instanceof File ? (
            <>
              {input.value.name} {formatFilesize(input.value.size, 'B')}{' '}
              {props.meta.touched && props.meta.error ? (
                <span className="text-danger">({props.meta.error})</span>
              ) : isTooLarge ? (
                <span className="text-danger">
                  ({translate('Image is too large')})
                </span>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
