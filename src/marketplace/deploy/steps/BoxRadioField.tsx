import { CaretDownIcon, CheckIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';

import { Menu, Radio } from 'waldur-ui';

import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { Select } from '@/form/select';
import { FormField } from '@/form/types';
import { translate } from '@/i18n';

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
        className={classNames('box-radio-wrapper vertical', {
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
              className={classNames('box-radio', {
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
              <div className="box-radio-header">
                {hasImage && (
                  <div className="box-radio-media">
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
              <div className="box-radio-info">
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
                <Radio
                  size="sm"
                  checked={isChecked}
                  onChange={() => onChange(selectedVersions[index].value)}
                  {...rest}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={classNames('box-radio-wrapper', {
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
            className={classNames('box-radio', { active: isChecked })}
          >
            <label className="box-radio-header">
              <div className="box-radio-media">
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
              <Radio
                checked={isChecked}
                hidden
                onChange={() => onChange(selectedVersions[index].value)}
                {...rest}
              />
            </label>
            <button
              className="box-radio-info"
              type="button"
              onClick={() => onChange(selectedVersions[index].value)}
            >
              {choice.options?.length ? (
                <Menu modal={false}>
                  {/* Trigger. asChild composes onto the existing <div> —
                      Radix's own default Trigger element is a <button>,
                      which can't nest inside the enclosing
                      "box-radio-info" <button> without breaking HTML
                      validity. */}
                  <Menu.Trigger asChild>
                    <div className="version-selector">
                      <div />
                      <div>
                        <div className="box-radio-label">{choice.label}</div>
                        <div className="box-radio-metadata">
                          {selectedVersions[index].label}
                        </div>
                      </div>
                      <span className="fs-1 fw-light">
                        <CaretDownIcon weight="bold" />
                      </span>
                    </div>
                  </Menu.Trigger>

                  {/* Options menu */}
                  <Menu.Content
                    align="start"
                    className="border fw-bold rounded-0 mw-250px fs-6 py-3"
                    // Compact rows, as in the footer menus.
                    density="compact"
                  >
                    {/* Radio items: picking a version is a single choice,
                        and the current one is announced as checked. */}
                    <Menu.RadioGroup
                      value={String(
                        choice.options.findIndex((option) =>
                          isEqual(option.value, selectedVersions[index].value),
                        ),
                      )}
                      onValueChange={(value) =>
                        onChangeSelect(choice.options[Number(value)], index)
                      }
                    >
                      {choice.options.map((option, i) => (
                        <Menu.RadioItem
                          key={i}
                          value={String(i)}
                          className="mx-[9.75px] rounded-md"
                        >
                          {option.label}
                        </Menu.RadioItem>
                      ))}
                    </Menu.RadioGroup>
                  </Menu.Content>
                </Menu>
              ) : (
                <>
                  <div className="box-radio-label">{choice.label}</div>
                  {choice.metadata && (
                    <div className="box-radio-metadata">{choice.metadata}</div>
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
