import { CaretDownIcon, CheckIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { FormCheck } from 'react-bootstrap';
import FormCheckInput from 'react-bootstrap/esm/FormCheckInput';

import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { Select } from '@waldur/form/themed-select';
import { FormField } from '@waldur/form/types';
import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/components';

import './BoxRadioField.scss';

export interface BoxRadioChoice {
  value: any;
  label: React.ReactNode;
  metadata?: React.ReactNode;
  image?: any;
  options?: Array<{ label; value }>;
}

interface BoxRadioFieldProps extends FormField {
  choices: BoxRadioChoice[];
  vertical?: boolean;
  ellipsisTitle?: boolean;
  hasOptions?: boolean;
  hasImage?: boolean;
  imagePlaceholder?: ReactNode;
  leftRadio?: boolean;
  hoverable?: boolean;
  alignTop?: boolean;
}

const getRadioVersions = (choices: BoxRadioChoice[]) => {
  return choices.map((choice) =>
    choice.options?.length
      ? choice.options[0]
      : { value: choice.value, label: choice.label },
  );
};

export const BoxRadioField: React.FC<BoxRadioFieldProps> = ({
  input,
  choices,
  vertical,
  ellipsisTitle,
  hasImage = true,
  imagePlaceholder,
  hasOptions = true,
  leftRadio,
  hoverable,
  alignTop,
  ...rest
}) => {
  const [selectedVersions, setSelectedVersions] = useState(() =>
    getRadioVersions(choices),
  );

  const onChange = useCallback(
    (value) => {
      input.onChange(value);
    },
    [input],
  );
  const onChangeSelect = useCallback(
    (option, index) => {
      setSelectedVersions((prev) => {
        prev[index] = option;
        return prev;
      });
      onChange(option.value);
      MenuComponent.hideDropdowns(null);
    },
    [onChange, setSelectedVersions],
  );

  useEffect(() => {
    setSelectedVersions(getRadioVersions(choices));
    MenuComponent.reinitialization();
  }, [choices, setSelectedVersions]);

  if (vertical) {
    return (
      <div
        className={classNames('form-check-boxes-wrapper vertical', {
          'left-radio': leftRadio,
          'align-top': alignTop,
          hoverable,
        })}
      >
        {choices.map((choice, index) => {
          const isChecked = [choice.value]
            .concat((choice.options || []).map((x) => x.value))
            .some((v) => isEqual(v, input.value));

          if (!choice) {
            return null;
          }
          return (
            <div
              key={index}
              className={classNames('form-check-box', {
                'flex-wrap': hasOptions,
                active: isChecked,
              })}
              onClick={() => onChange(selectedVersions[index].value)}
              role="radio"
              aria-checked={isChecked}
              tabIndex={index}
              onKeyDown={(e) =>
                e.key === 'Enter' && onChange(selectedVersions[index].value)
              }
            >
              <div className="form-check-header">
                {hasImage && (
                  <div className="form-check-wrapper">
                    {choice.image ? (
                      choice.image
                    ) : imagePlaceholder ? (
                      imagePlaceholder
                    ) : typeof choice.label === 'string' ? (
                      <ImagePlaceholder width="48px" height="48px">
                        {choice.label.toUpperCase().substring(0, 4)}
                      </ImagePlaceholder>
                    ) : (
                      <span className="display-6">
                        <CheckIcon weight="bold" />
                      </span>
                    )}
                  </div>
                )}
                <div>
                  <p
                    className={classNames(
                      'fs-6 fw-bold mb-0',
                      ellipsisTitle && 'ellipsis-lines-1',
                    )}
                  >
                    {choice.label}
                  </p>
                  {Boolean(choice.metadata) &&
                    (['string', 'number'].includes(typeof choice.metadata) ? (
                      <p className="fs-6 fw-semibold text-muted mb-0">
                        {choice.metadata}
                      </p>
                    ) : (
                      choice.metadata
                    ))}
                </div>
              </div>
              <div className="form-check-info">
                {hasOptions && (
                  <Select
                    value={selectedVersions[index]}
                    onChange={(value) => onChangeSelect(value, index)}
                    options={choice.options}
                    getOptionLabel={(option) =>
                      option.label || translate('Default')
                    }
                    className="metronic-select-container"
                    classNamePrefix="metronic-select"
                  />
                )}
                <div className="form-check form-check-custom form-check-sm d-block">
                  <FormCheck
                    className="flex-shrink-0"
                    type="radio"
                    checked={isChecked}
                    onChange={() => onChange(selectedVersions[index].value)}
                    {...rest}
                  />
                  {/* <input
                    className="form-check-input flex-shrink-0"
                    type="radio"
                    checked={isChecked}
                    onChange={() => onChange(selectedVersions[index].value)}
                    {...rest}
                  /> */}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={classNames('form-check-boxes-wrapper', {
        hoverable: hoverable,
      })}
    >
      {choices.map((choice, index) => {
        const isChecked = [choice.value]
          .concat((choice.options || []).map((x) => x.value))
          .some((v) => isEqual(v, input.value));

        if (!choice) {
          return null;
        }
        return (
          <div
            key={index}
            className={classNames('form-check-box', { active: isChecked })}
          >
            <label className="form-check-header">
              <div className="form-check-wrapper">
                {choice.image ? (
                  choice.image
                ) : typeof choice.label === 'string' ? (
                  choice.label.toUpperCase().substring(0, 4)
                ) : (
                  <span className="display-6">
                    <CheckIcon weight="bold" />
                  </span>
                )}
              </div>
              {/* <input
                className="form-check-input"
                type="radio"
                checked={isChecked}
                hidden
                onChange={() => onChange(selectedVersions[index].value)}
                {...rest}
              /> */}
              <FormCheckInput
                type="radio"
                checked={isChecked}
                hidden
                onChange={() => onChange(selectedVersions[index].value)}
                {...rest}
              />
            </label>
            <button
              className="form-check-info"
              type="button"
              onClick={() => onChange(selectedVersions[index].value)}
            >
              {choice.options?.length ? (
                <>
                  {/* Trigger */}
                  <div
                    className="version-selector"
                    data-kt-menu-trigger="click"
                    data-kt-menu-attach="parent"
                    data-kt-menu-placement="bottom"
                  >
                    <div />
                    <div>
                      <div className="form-check-label">{choice.label}</div>
                      <div className="form-check-metadata">
                        {selectedVersions[index].label}
                      </div>
                    </div>
                    <span className="fs-1 fw-light">
                      <CaretDownIcon weight="bold" />
                    </span>
                  </div>

                  {/* Options menu */}
                  <div
                    className="versions menu menu-sub menu-sub-dropdown menu-rounded menu-gray-600 menu-active-bg-light-primary menu-hover-title-primary border fw-bold rounded-0 mw-250px fs-6 py-3"
                    data-kt-menu="true"
                  >
                    {choice.options.map((option, i) => (
                      <div
                        key={i}
                        className="menu-item px-3"
                        data-kt-menu-trigger
                      >
                        <span
                          className="menu-link px-3"
                          onClick={() => onChangeSelect(option, index)}
                          aria-hidden="true"
                        >
                          <span className="menu-title">{option.label}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="form-check-label">{choice.label}</div>
                  {choice.metadata && (
                    <div className="form-check-metadata">{choice.metadata}</div>
                  )}
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};
