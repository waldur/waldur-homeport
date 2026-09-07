import { CaretDownIcon, CheckIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { FormCheck } from 'react-bootstrap';
import FormCheckInput from 'react-bootstrap/esm/FormCheckInput';

import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { Select } from '@/form/select';
import { FormField } from '@/form/types';
import { translate } from '@/i18n';
import {
  NavMenu,
  NavMenuContent,
  NavMenuItem,
  NavMenuTrigger,
} from '@/navigation/NavMenu';

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
    },
    [onChange, setSelectedVersions],
  );

  useEffect(() => {
    setSelectedVersions(getRadioVersions(choices));
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
                <NavMenu modal={false}>
                  {/* Trigger. asChild composes onto the existing <div> —
                      Radix's own default Trigger element is a <button>,
                      which can't nest inside the enclosing
                      "form-check-info" <button> without breaking HTML
                      validity. */}
                  <NavMenuTrigger asChild>
                    <div className="version-selector">
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
                  </NavMenuTrigger>

                  {/* Options menu */}
                  <NavMenuContent
                    placement="bottom-start"
                    className="versions menu menu-rounded menu-gray-600 menu-active-bg-light-primary menu-hover-title-primary border fw-bold rounded-0 mw-250px fs-6 py-3"
                  >
                    {choice.options.map((option, i) => (
                      <NavMenuItem
                        key={i}
                        wrapperClassName="px-3"
                        className="px-3"
                        onSelect={() => onChangeSelect(option, index)}
                      >
                        <span className="menu-title">{option.label}</span>
                      </NavMenuItem>
                    ))}
                  </NavMenuContent>
                </NavMenu>
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
