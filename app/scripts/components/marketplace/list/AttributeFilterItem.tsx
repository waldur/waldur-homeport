import { ReactNode } from 'react';
import * as React from 'react';
import MediaQuery from 'react-responsive';

import { CollapsibleItem } from '@waldur/marketplace/list/CollapsibleItem';

interface AttributeFilterItemProps {
  title: ReactNode;
  children: ReactNode;
}

export const AttributeFilterItem: React.SFC<AttributeFilterItemProps> = (props: AttributeFilterItemProps) => (
  <MediaQuery minWidth={768}>
    {matches => matches ? (
      <>
        {props.title}
        {props.children}
      </>) : (
      <CollapsibleItem
        title={props.title}
        content={props.children}
      />
      )
    }
  </MediaQuery>
);
