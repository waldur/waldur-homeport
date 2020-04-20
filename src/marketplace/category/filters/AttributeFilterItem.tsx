import { ReactNode } from 'react';
import * as React from 'react';
import MediaQuery from 'react-responsive';

import { CollapsibleItem } from './CollapsibleItem';

interface AttributeFilterItemProps {
  title: ReactNode;
  selected?: boolean;
  counter?: number;
}

export const AttributeFilterItem: React.FC<AttributeFilterItemProps> = props => (
  <MediaQuery minWidth={768}>
    {matches =>
      matches ? (
        <>
          {props.title}
          {props.children}
        </>
      ) : (
        <CollapsibleItem
          title={props.title}
          selected={props.selected}
          counter={props.counter}
        >
          {props.children}
        </CollapsibleItem>
      )
    }
  </MediaQuery>
);
