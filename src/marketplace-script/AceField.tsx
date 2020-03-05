import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

function configureAce(ace) {
  ace.config.setModuleUrl(
    'ace/mode/python',
    require('file-loader?esModule=false!ace-builds/src-noconflict/mode-python.js'),
  );
  ace.config.setModuleUrl(
    'ace/mode/sh',
    require('file-loader?esModule=false!ace-builds/src-noconflict/mode-sh.js'),
  );
  ace.config.setModuleUrl(
    'ace/theme/github',
    require('file-loader?esModule=false!ace-builds/src-noconflict/theme-github.js'),
  );
}

export const AceField = props => {
  const [loaded, setLoaded] = React.useState(false);
  const [erred, setErred] = React.useState(false);
  const EditorRef = React.useRef(null);

  React.useEffect(() => {
    async function load() {
      try {
        EditorRef.current = await import(
          /* webpackChunkName: "react-ace" */ 'react-ace'
        );
        configureAce(((window as unknown) as { ace: any }).ace);
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
    return <input className="form-control" {...props} />;
  }

  return (
    <EditorRef.current.default
      theme="github"
      fontSize="12pt"
      mode={props.mode || 'python'}
      value={props.input.value}
      onChange={props.input.onChange}
    />
  );
};
