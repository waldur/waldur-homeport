import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

import { EDIT_SCRIPT_FORM_ID } from './constants';
import { ScriptEditorProps } from './types';

const EditScriptLanguageDialog = lazyComponent(() =>
  import('./EditScriptLanguageDialog').then((module) => ({
    default: module.EditScriptLanguageDialog,
  })),
);

const EditScriptDialog = lazyComponent(() =>
  import('./EditScriptDialog').then((module) => ({
    default: module.EditScriptDialog,
  })),
);

export const EditScriptButton: FunctionComponent<ScriptEditorProps> = (
  props,
) => {
  const { openDialog } = useModal();
  const callback = () => {
    if (props.type === 'language') {
      openDialog(EditScriptLanguageDialog, {
        resolve: props,
        formId: EDIT_SCRIPT_FORM_ID,
        size: 'sm',
      });
    } else {
      openDialog(EditScriptDialog, {
        resolve: props,
        formId: EDIT_SCRIPT_FORM_ID,
        size: 'xl',
        onHide: null,
      });
    }
  };
  return <CompactEditButton onClick={callback} />;
};
