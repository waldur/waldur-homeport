import * as React from 'react';

import { FormattedHtml } from '@waldur/core/FormattedHtml';

import { Attribute } from '../types';

import { SecretField } from './SecretField';

interface AttributeCellProps {
  value: string | string[] | number | boolean | undefined;
  attr: Attribute;
}

export const AttributeCell: React.FC<AttributeCellProps> = ({
  attr,
  value,
}) => {
  switch (attr.type) {
    case 'list': {
      const titles = [];
      if (Array.isArray(value)) {
        value.forEach(key => {
          const option = attr.options.find(item => item.key === key);
          if (option) {
            titles.push(option.title);
          }
        });
      }
      return (
        <>
          {titles.map((item, index) => (
            <span key={index}>
              <i className="fa fa-check" />
              {` ${item}`}
              <br />
            </span>
          ))}
        </>
      );
    }

    case 'boolean': {
      const icon =
        value === true ? 'fa fa-check text-info' : 'fa fa-times text-danger';
      return <i className={icon} />;
    }

    case 'choice': {
      const option = attr.options.find(item => item.key === value);
      return <>{option ? option.title : 'N/A'}</>;
    }

    case 'password': {
      return (
        <>{typeof value === 'string' ? <SecretField value={value} /> : 'N/A'}</>
      );
    }

    case 'html':
      return <FormattedHtml html={value.toString()} />;

    default:
      return <>{value === undefined ? 'N/A' : value}</>;
  }
};
