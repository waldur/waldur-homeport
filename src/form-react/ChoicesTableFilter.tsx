import * as classNames from 'classnames';
import * as React from 'react';

import { FilterOptions } from '@waldur/form/types';

interface ChoicesTableFilterProps {
  filterOptions: FilterOptions;
  input: {
    value: string;
    onChange(value?: string): void;
  };
  wrapperClassName?: string;
}

export class ChoicesTableFilter extends React.Component<ChoicesTableFilterProps> {
  getBtnClass = (index, choice, props) => {
    if (index === 0 && !props.input.value) {
      return 'btn btn-sm btn-primary';
    }
    return classNames(
      'btn btn-sm',
      {'btn-default': choice.value !== props.input.value},
      {'btn-primary': choice.value === props.input.value}
    );
  }

  componentDidMount() {
    if (this.props.filterOptions.defaultValue) {
      this.props.input.onChange(this.props.filterOptions.defaultValue);
    }
  }

  render() {
    const props = this.props;
    return (
      <>
        {props.filterOptions.choices.length > 0 && (
          <div className={props.wrapperClassName || 'btn-group'}>
            {props.filterOptions.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => props.input.onChange(choice.value)}
                className={this.getBtnClass(index, choice, props)}
                type="button">
                  {choice.label}
              </button>
            ))}
          </div>)
        }
      </>
    );
  }
}
