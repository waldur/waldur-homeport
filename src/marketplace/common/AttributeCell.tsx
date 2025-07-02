import { CheckIcon, XIcon } from '@phosphor-icons/react';
import React from 'react';
import { NestedAttribute } from 'waldur-js-client';

interface AttributeCellProps {
  value: string | string[] | number | boolean | undefined;
  attr: NestedAttribute;
}

export const AttributeCell: React.FC<AttributeCellProps> = ({
  attr,
  value,
}) => {
  switch (attr.type) {
    case 'list': {
      const titles = [];
      if (Array.isArray(value)) {
        value.forEach((key) => {
          const option = attr.options.find((item) => item.key === key);
          if (option) {
            titles.push(option.title);
          }
        });
      }
      return (
        <>
          {titles.map((item, index) => (
            <span key={index}>
              <CheckIcon weight="bold" />
              {` ${item}`}
              <br />
            </span>
          ))}
        </>
      );
    }

    case 'boolean': {
      return value === true ? (
        <CheckIcon weight="bold" className="text-info" />
      ) : (
        <XIcon weight="bold" className="text-danger" />
      );
    }

    case 'choice': {
      const option = attr.options.find((item) => item.key === value);
      return <>{option ? option.title : 'N/A'}</>;
    }

    default:
      return <>{value === undefined ? 'N/A' : value}</>;
  }
};
