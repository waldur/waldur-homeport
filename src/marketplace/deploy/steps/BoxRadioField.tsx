import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

import { FormField } from '@waldur/form/types';
import { MenuComponent } from '@waldur/metronic/assets/ts/components';

import './BoxRadioField.scss';

export interface BoxRadioChoice {
  value: any;
  label: React.ReactNode;
  metadata?: React.ReactNode;
  image?: React.ReactNode;
  options?: Array<{ label; value }>;
}

interface BoxRadioFieldProps extends FormField {
  choices: BoxRadioChoice[];
}

const getRadioVersions = (choices: BoxRadioChoice[]) => {
  return choices.map((choice) =>
    choice.options?.length
      ? choice.options[0]
      : { value: choice.value, label: choice.label },
  );
};

export const BoxRadioField: React.FC<BoxRadioFieldProps> = (props) => {
  const { input, choices, ...rest } = props;

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

  return (
    <div className="form-check-boxes-wrapper">
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
            className={'form-check-box' + (isChecked ? ' active' : '')}
          >
            <label className="form-check-header">
              <div className="form-check-wrapper">
                {choice.image ? (
                  choice.image
                ) : typeof choice.label === 'string' ? (
                  choice.label.toUpperCase().substring(0, 4)
                ) : (
                  <i className="fa fa-check display-6"></i>
                )}
              </div>
              <input
                {...input}
                className="form-check-input"
                type="radio"
                checked={isChecked}
                value={selectedVersions[index]?.value}
                hidden
                onChange={() => onChange(selectedVersions[index].value)}
                {...rest}
              />
            </label>
            <div
              className="form-check-info"
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
                    <div></div>
                    <div>
                      <div className="form-check-label">{choice.label}</div>
                      <div className="form-check-metadata">
                        {selectedVersions[index].label}
                      </div>
                    </div>
                    <i className="fa fa-angle-down fs-1 fw-light"></i>
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
                        <a
                          className="menu-link px-3"
                          onClick={() => onChangeSelect(option, index)}
                        >
                          <span className="menu-title">{option.label}</span>
                        </a>
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
            </div>
          </div>
        );
      })}
    </div>
  );
};
