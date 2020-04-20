import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import './WysiwygEditor.scss';

const TOOLBAR_OPTIONS = [
  'inline',
  'blockType',
  'fontSize',
  'list',
  'textAlign',
  'link',
  'embedded',
  'emoji',
  'image',
  'remove',
  'history',
];

interface DraftModule {
  Editor: any;
  htmlToDraft: any;
  convertToRaw: any;
  draftToHtml: any;
  ContentState: any;
  EditorState: any;
}

const loadModule = () =>
  import(/* webpackChunkName: "draft-js" */ './draftjs-module');

export const WysiwygEditor = props => {
  const [editorState, setEditorState] = React.useState();

  const contentRef = React.useRef();

  const { loading, error, value: moduleValue } = useAsync<DraftModule>(
    loadModule,
  );

  React.useEffect(() => {
    if (!moduleValue) {
      return;
    }
    const contentBlock = moduleValue.htmlToDraft(props.input.value);
    if (contentBlock) {
      const contentState = moduleValue.ContentState.createFromBlockArray(
        contentBlock.contentBlocks,
      );
      const editorState = moduleValue.EditorState.createWithContent(
        contentState,
      );
      setEditorState(editorState);
    }
  }, [moduleValue]);

  const onEditorStateChange = React.useCallback(
    editorState => {
      const htmlValue = moduleValue.draftToHtml(
        moduleValue.convertToRaw(editorState.getCurrentContent()),
      );
      if (contentRef.current != htmlValue) {
        props.input.onChange(htmlValue);
        contentRef.current = htmlValue;
      }
      setEditorState(editorState);
    },
    [moduleValue, props.input],
  );

  if (error) {
    return <>{translate('Unable to load editor')}</>;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (moduleValue) {
    return (
      <moduleValue.Editor
        toolbar={{ options: TOOLBAR_OPTIONS }}
        editorState={editorState}
        wrapperClassName="demo-wrapper"
        editorClassName="demo-editor"
        onEditorStateChange={onEditorStateChange}
      />
    );
  }
  return null;
};
