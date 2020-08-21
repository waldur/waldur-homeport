import * as React from 'react';
import { Validator } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

interface MonacoFieldProps {
  name?: string;
  label?: string;
  required?: boolean;
  description?: string;
  validate?: Validator;
  input?: { value; onChange };
  diff?: boolean;
  mode?: string;
  height?: number;
  original?: string;
  options?: any;
}

export const MonacoField: React.FC<MonacoFieldProps> = (props) => {
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
  const Editor = props.diff
    ? EditorRef.current.MonacoDiffEditor
    : EditorRef.current.default;

  return (
    <Editor
      height={props.height}
      language={props.mode}
      value={props.input.value}
      onChange={props.input.onChange}
      original={props.original}
      options={props.options}
    />
  );
};

MonacoField.defaultProps = {
  height: 600,
};
