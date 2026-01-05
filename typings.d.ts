declare module '*.json' {
  const value: Record<string, string>;
  export default value;
}

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.svg' {
  import * as React from 'react';

  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

  export default ReactComponent;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.mp4' {
  const value: string;
  export default value;
}

declare module '*.md' {
  import React from 'react';
  const ReactComponent: React.FC;
  export { ReactComponent };
}

declare module '*.woff';
declare module '*.woff2';
