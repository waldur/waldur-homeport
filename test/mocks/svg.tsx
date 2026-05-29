import React from 'react';

const SvgMock = React.forwardRef((props: any, ref: any) => (
  <svg data-testid="svg-mock" ref={ref} {...props} />
));

SvgMock.displayName = 'SvgMock';

export const ReactComponent = SvgMock;
export default SvgMock;
