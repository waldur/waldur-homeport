import { ReactNode } from 'react';
import * as React from 'react';
import MediaQuery from 'react-responsive';

import { CollapsibleItem } from './CollapsibleItem';

interface AttributeFilterItemProps {
  title: ReactNode;
  children: ReactNode;
  selected?: boolean;
  counter?: number;
}

export const AttributeFilterItem: React.SFC<AttributeFilterItemProps> = (props: AttributeFilterItemProps) => (
  <MediaQuery minWidth={768}>
    {matches => matches ? (
      <>
        {props.title}
        {props.children}
      </>
    ) : (
        <CollapsibleItem
          title={props.title}
          content={props.children}
          selected={props.selected}
          counter={props.counter}
        />
      )
    }
  </MediaQuery>
);
