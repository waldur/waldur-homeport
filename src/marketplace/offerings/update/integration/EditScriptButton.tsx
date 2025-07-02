import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

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
  const dispatch = useDispatch();
  const callback = () => {
    if (props.type === 'language') {
      dispatch(
        openModalDialog(EditScriptLanguageDialog, {
          resolve: props,
          formId: EDIT_SCRIPT_FORM_ID,
          size: 'sm',
        }),
      );
    } else {
      dispatch(
        openModalDialog(EditScriptDialog, {
          resolve: props,
          formId: EDIT_SCRIPT_FORM_ID,
          size: 'xl',
          onHide: null,
        }),
      );
    }
  };
  return <EditButton onClick={callback} size="sm" />;
};
