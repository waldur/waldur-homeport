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
import { FC, useRef } from 'react';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';

import InsertLinkPopover from './InsertLinkPopover';
import { FormField } from './types';

import '@mdxeditor/editor/style.css';
import './MarkdownEditor.scss';

interface MarkdownEditorProps extends FormField {
  placeholder?: string;
  className?: string;
}

const Toolbar = () => {
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

  return (
    <MDXEditor
      className={props.className}
      contentEditableClassName="editable-area"
      markdown={props.input?.value || ''}
      autoFocus={props.autoFocus}
      placeholder={props.placeholder}
      onChange={props.input?.onChange}
      plugins={[
        toolbarPlugin({ toolbarContents: () => <Toolbar /> }),
        listsPlugin(),
        quotePlugin(),
        ...(isFeatureVisible(
          MarketplaceFeatures.allow_display_of_images_in_markdown,
        )
          ? [imagePlugin()]
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
      ]}
    />
  );
};

export default MarkdownEditor;
