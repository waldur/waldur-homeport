import { FC, PropsWithChildren, useCallback } from 'react';

import { CopyFeedback, CopyFeedbackProvider } from 'waldur-ui';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

/**
 * Turns every waldur-ui copy (a `PropertyItem` with `hasCopy`, a
 * `CopyButton`) into the same toast `CopyToClipboardButton` shows, naming
 * what was copied when the button knows it ("Backend ID has been copied").
 */
export const AppCopyFeedback: FC<PropsWithChildren> = ({ children }) => {
  const { showSuccess } = useNotify();
  const onCopied = useCallback(
    ({ name }: CopyFeedback) =>
      showSuccess(
        translate('{name} has been copied', {
          name: name ?? translate('Text'),
        }),
      ),
    [showSuccess],
  );
  return (
    <CopyFeedbackProvider onCopied={onCopied}>{children}</CopyFeedbackProvider>
  );
};
