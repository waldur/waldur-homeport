import * as classNames from 'classnames';
import * as React from 'react';

import { Attribute } from '../types';

interface AttributeCellProps {
  value: string | string[] | number | boolean | undefined;
  attr: Attribute;
  className?: string;
}

export const AttributeCell = (props: AttributeCellProps) => {
  switch (props.attr.type) {
    case 'list': {
      const titles = [];
      if (Array.isArray(props.value)) {
        props.value.map(key => {
          const option = props.attr.options.find(item => item.key === key);
          if (option) {
            titles.push(option.title);
          }
        });
      }
      return (
        <td className={props.className}>
          {titles.map((item, index) => (
            <span key={index}>
              <i className="fa fa-check"/>{` ${item}`}
              <br/>
            </span>
          ))}
        </td>
      );
    }

    case 'boolean': {
      const icon = props.value === true ? 'fa fa-check text-info' : 'fa fa-times text-danger';
      return (
        <td className={classNames('text-center', props.className)}>
          <i className={icon} />
        </td>
      );
    }

    case 'choice': {
      const option = props.attr.options.find(item => item.key === props.value);
      return <td className={props.className}>{option ? option.title : 'N/A'}</td>;
    }

    default:
      return <td className={props.className}>{props.value === undefined ? 'N/A' : props.value}</td>;
  }
};
