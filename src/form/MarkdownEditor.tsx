import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  imagePlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ChangeCodeMirrorLanguage,
  CodeToggle,
  CreateLink,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  markdownShortcutPlugin,
  ConditionalContents,
  Separator,
  StrikeThroughSupSubToggles,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
} from '@mdxeditor/editor';
import classNames from 'classnames';
import { FC, useMemo, useRef } from 'react';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { useTheme } from '@/theme/useTheme';

import InsertLinkPopover from './InsertLinkPopover';
import {
  isMarkdownImageDisplayEnabled,
  isMarkdownImageUploadEnabled,
  uploadOfferingMarkdownImage,
} from './markdownImageUpload';
import { FormField } from './types';

import '@mdxeditor/editor/style.css';
import './MarkdownEditor.scss';

interface MarkdownEditorProps extends FormField {
  placeholder?: string;
  className?: string;
  /** Offering UUID for markdown image uploads via the provider offerings API. */
  offeringUuid?: string;
}

const Toolbar = ({ showImages }: { showImages: boolean }) => {
  return (
    <DiffSourceToggleWrapper>
      <ConditionalContents
        options={[
          {
            when: (editor) => editor?.editorType === 'codeblock',
            contents: () => <ChangeCodeMirrorLanguage />,
          },
          {
            fallback: () => (
              <>
                <UndoRedo />

                <Separator />
                <BoldItalicUnderlineToggles />
                <CodeToggle />

                <Separator />
                <StrikeThroughSupSubToggles />

                <Separator />
                <ListsToggle />

                <Separator />
                <BlockTypeSelect />

                <Separator />
                <CreateLink />

                {showImages && (
                  <>
                    <Separator />
                    <InsertImage />
                  </>
                )}

                <Separator />
                <InsertTable />
                <InsertThematicBreak />

                <Separator />
                <InsertCodeBlock />
              </>
            ),
          },
        ]}
      />
    </DiffSourceToggleWrapper>
  );
};

const MarkdownEditor: FC<MarkdownEditorProps> = (props) => {
  const initialValue = useRef(props.input?.value);
  const { showErrorResponse } = useNotify();
  const { theme } = useTheme();
  const showImages = isMarkdownImageDisplayEnabled();

  const imageUploadHandler = useMemo(() => {
    if (!props.offeringUuid || !isMarkdownImageUploadEnabled()) {
      return undefined;
    }
    const offeringUuid = props.offeringUuid;
    return async (image: File) => {
      try {
        return await uploadOfferingMarkdownImage(offeringUuid, image);
      } catch (error) {
        showErrorResponse(error, translate('Unable to upload image.'));
        throw error;
      }
    };
  }, [props.offeringUuid, showErrorResponse]);

  const plugins = useMemo(
    () => [
      toolbarPlugin({
        toolbarContents: () => <Toolbar showImages={showImages} />,
      }),
      listsPlugin(),
      quotePlugin(),
      ...(showImages
        ? [
            imagePlugin({
              imageUploadHandler,
            }),
          ]
        : []),
      headingsPlugin(),
      linkPlugin(),
      linkDialogPlugin({
        LinkDialog: () => <InsertLinkPopover />,
      }),
      tablePlugin(),
      thematicBreakPlugin(),
      codeBlockPlugin({ defaultCodeBlockLanguage: '' }),
      codeMirrorPlugin({
        codeBlockLanguages: {
          py: 'Python',
          java: 'Java',
          js: 'JavaScript',
          tsx: 'TypeScript',
          php: 'PHP',
          txt: 'Plain Text',
          '': 'Unspecified',
        },
      }),
      markdownShortcutPlugin(),
      diffSourcePlugin({
        viewMode: 'rich-text',
        readOnlyDiff: true,
        diffMarkdown: initialValue.current,
      }),
    ],
    [showImages, imageUploadHandler],
  );

  return (
    <MDXEditor
      className={classNames(props.className, {
        // MDXEditor copies the editor root's classes onto its portaled popups
        // (toolbar dialogs, link/image dialogs), so this also fixes their
        // contrast in dark mode.
        'dark-theme': theme === 'dark',
      })}
      contentEditableClassName="editable-area"
      markdown={props.input?.value || ''}
      autoFocus={props.autoFocus}
      placeholder={props.placeholder}
      onChange={props.input?.onChange}
      plugins={plugins}
    />
  );
};

export default MarkdownEditor;
