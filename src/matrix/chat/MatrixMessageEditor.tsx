import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

import { useMatrixMessageActions } from './MatrixMessageActionsContext';
import { MatrixChatMessage } from './types';

/**
 * Edits a message in place of its text: Enter saves, Shift+Enter adds a
 * line, Escape cancels.
 */
export const MatrixMessageEditor: FC<{ message: MatrixChatMessage }> = ({
  message,
}) => {
  const { saveEdit, cancelEdit } = useMatrixMessageActions();
  const [text, setText] = useState(message.body);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, []);

  const empty = !text.trim();

  const save = async () => {
    if (empty || saving) return;
    setSaving(true);
    try {
      await saveEdit(message, text);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cancelEdit();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      save();
    }
  };

  return (
    <div className="tc-msg-editor">
      <textarea
        ref={textareaRef}
        className="tc-msg-editor__input"
        aria-label={translate('Edit message')}
        rows={Math.min(8, Math.max(2, text.split('\n').length))}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={saving}
      />
      <div className="tc-msg-editor__actions">
        <BaseButton
          variant="tertiary"
          size="sm"
          label={translate('Cancel')}
          onClick={cancelEdit}
        />
        <BaseButton
          variant="primary"
          size="sm"
          label={translate('Save')}
          onClick={save}
          pending={saving}
          disabled={empty}
          tooltip={
            empty
              ? translate('A message cannot be empty. Delete it instead.')
              : undefined
          }
        />
      </div>
    </div>
  );
};
