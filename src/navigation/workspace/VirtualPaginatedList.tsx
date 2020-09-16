import * as React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { FixedSizeList as List } from 'react-window';
import paginate from 'react-window-paginated';

const PaginatedList = paginate(List);

const CustomScrollbars = ({ onScroll, forwardedRef, style, children }) => {
  const refSetter = React.useCallback(
    (scrollbarsRef) => {
      if (scrollbarsRef) {
        forwardedRef(scrollbarsRef.view);
      } else {
        forwardedRef(null);
      }
    },
    [forwardedRef],
  );

  return (
    <Scrollbars
      ref={refSetter}
      style={{ ...style, overflow: 'hidden' }}
      onScroll={onScroll}
    >
      {children}
    </Scrollbars>
  );
};

const CustomScrollbarsVirtualList = React.forwardRef((props: any, ref) => (
  <CustomScrollbars {...props} forwardedRef={ref} />
));

export const VirtualPaginatedList = (props) => (
  <PaginatedList {...props} outerElementType={CustomScrollbarsVirtualList} />
);
