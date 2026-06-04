import { FunctionComponent } from 'react';
import { components } from 'react-select';

import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import {
  AsyncSelect,
  FilterSelectClearIndicator,
  FilterSelectControl,
} from '@/form/select';

const renderIcon = (src: string, imgStyle: any) =>
  src ? (
    <img
      src={src}
      alt="thumb"
      style={{
        display: 'inline-block',
        marginRight: 10,
        position: 'relative',
        top: -2,
        verticalAlign: 'middle',
        ...imgStyle,
      }}
    />
  ) : (
    <ImagePlaceholder
      width={imgStyle.width}
      height={imgStyle.width}
      className="me-3"
    />
  );

export const Option = (props) => {
  const img = renderIcon(props.data.thumbnail, { width: 19 });
  return (
    <components.Option {...props}>
      <div className="d-flex align-items-center">
        {img}
        <span className="ellipsis-lines ellipsis-lines-2">
          {`${props.data.category_title} / ${props.data.name}`}
        </span>
      </div>
    </components.Option>
  );
};

export const SingleValue = (props) => {
  const img = renderIcon(props.data.thumbnail, { width: 19 });
  return (
    <components.SingleValue {...props}>
      {img}
      {props.children}
    </components.SingleValue>
  );
};

interface AutocompleteFieldProps {
  placeholder: string;
  loadOfferings: (
    query: string,
    prevOptions,
    additional: { page: number },
  ) => any;
  onChange: (offeringId: string) => void;
  value?: any;
  noOptionsMessage?: (message) => string;
  reactSelectProps?: any;
}

export const AutocompleteField: FunctionComponent<AutocompleteFieldProps> = (
  props,
) => (
  <AsyncSelect
    placeholder={props.placeholder}
    loadOptions={props.loadOfferings}
    defaultOptions
    getOptionValue={(option) => option.uuid}
    getOptionLabel={(option) => `${option.category_title} / ${option.name}`}
    value={props.value}
    onChange={(value: any) => props.onChange(value)}
    noOptionsMessage={props.noOptionsMessage}
    isClearable={true}
    {...props.reactSelectProps}
    components={{
      Option,
      SingleValue,
      Control: FilterSelectControl,
      ClearIndicator: FilterSelectClearIndicator,
    }}
  />
);
