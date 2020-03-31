import * as React from 'react';
import { useEffect, useState } from 'react';

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

export const WysiwygEditor = props => {
  const [editorState, setEditorState] = useState();
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [erred, setErred] = useState(false);

  const moduleRef = React.useRef<DraftModule>();
  const contentRef = React.useRef();

  useEffect(() => {
    async function loadAll() {
      try {
        moduleRef.current = await import(
          /* webpackChunkName: "draft-js" */ './draftjs-module'
        );

        const contentBlock = moduleRef.current.htmlToDraft(props.input.value);
        if (contentBlock) {
          const contentState = moduleRef.current.ContentState.createFromBlockArray(
            contentBlock.contentBlocks,
          );
          const editorState = moduleRef.current.EditorState.createWithContent(
            contentState,
          );
          setEditorState(editorState);
        }
        setLoading(false);
        setLoaded(true);
      } catch (e) {
        setErred(e);
        setLoading(false);
        setLoaded(false);
      }
    }
    loadAll();
  }, []);

  const onEditorStateChange = React.useCallback(editorState => {
    const htmlValue = moduleRef.current.draftToHtml(
      moduleRef.current.convertToRaw(editorState.getCurrentContent()),
    );
    if (contentRef.current != htmlValue) {
      props.input.onChange(htmlValue);
      contentRef.current = htmlValue;
    }
    setEditorState(editorState);
  }, []);

  if (erred) {
    return <>{translate('Unable to load editor')}</>;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (loaded) {
    const Editor = moduleRef.current.Editor;
    return (
      <Editor
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
