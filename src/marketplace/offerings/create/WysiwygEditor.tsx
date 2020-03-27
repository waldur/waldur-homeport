import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './WysiwygEditor.scss';

export const WysiwygEditor = props => {
  const [editorState, setEditorState] = useState();
  const [editor, setEditor] = useState();

  let _contentState, _editorState, _convertToRaw, _draftToHtml, _htmlToDraft;
  Promise.all([
    import('draft-js'),
    import('draftjs-to-html'),
    import('html-to-draftjs'),
    import('react-draft-wysiwyg'),
  ]).then(
    ([
      { ContentState, EditorState, convertToRaw },
      { default: draftToHtml },
      { default: htmlToDraft },
    ]) => {
      _contentState = ContentState;
      _editorState = EditorState;
      _convertToRaw = convertToRaw;
      _draftToHtml = draftToHtml;
      _htmlToDraft = htmlToDraft;
    },
  );

  useEffect(() => {
    setTimeout(() => {
      const contentBlock = _htmlToDraft(props.input.value);
      if (contentBlock) {
        const contentState = _contentState.createFromBlockArray(
          contentBlock.contentBlocks,
        );
        const editorState = _editorState.createWithContent(contentState);
        setEditorState(editorState);
      }
    });
  }, []);

  // This updates the redux-form wrapper
  const changeValue = useCallback(
    editorState => {
      const htmlValue = _draftToHtml(
        _convertToRaw(editorState.getCurrentContent()),
      );
      props.input.onChange(htmlValue);
    },
    [editorState],
  );

  const onEditorStateChange = editorState => {
    setEditorState(editorState);
    changeValue(editorState);
  };

  useEffect(() => {
    import('react-draft-wysiwyg').then(module => {
      const { Editor } = module;
      const editorJsx = (
        <Editor
          {...props.input}
          toolbar={{
            options: [
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
            ],
          }}
          editorState={editorState}
          wrapperClassName="demo-wrapper"
          editorClassName="demo-editor"
          onEditorStateChange={onEditorStateChange}
          onChange={e => {
            e.preventDefault();
          }}
        />
      );
      setEditor(editorJsx);
    });
  }, [editorState]);

  return <div>{editor}</div>;
};
