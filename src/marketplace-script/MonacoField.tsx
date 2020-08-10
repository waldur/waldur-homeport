import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

export const MonacoField = (props) => {
  const [loaded, setLoaded] = React.useState(false);
  const [erred, setErred] = React.useState(false);
  const EditorRef = React.useRef(null);

  React.useEffect(() => {
    async function load() {
      try {
        EditorRef.current = await import(
          /* webpackChunkName: "react-monaco-editor" */ 'react-monaco-editor'
        );
        setLoaded(true);
      } catch {
        setLoaded(false);
        setErred(true);
      }
    }
    load();
  }, []);

  if (!loaded) {
    return <LoadingSpinner />;
  }

  if (erred) {
    return (
      <input
        className="form-control"
        value={props.input.value}
        onChange={props.input.onChange}
      />
    );
  }

  return (
    <EditorRef.current.default
      height="600"
      language={props.mode}
      value={props.input.value}
      onChange={props.input.onChange}
    />
  );
};
