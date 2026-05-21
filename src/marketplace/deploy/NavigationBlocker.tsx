import { useRouter } from '@uirouter/react';
import { useEffect } from 'react';
import { useFormState } from 'react-final-form';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

export const NavigationBlocker = () => {
  const router = useRouter();
  const { confirm } = useModal();
  const { dirty, submitting, submitSucceeded } = useFormState({
    subscription: { dirty: true, submitting: true, submitSucceeded: true },
  });

  useEffect(() => {
    if (!dirty || submitting || submitSucceeded) return;

    const deregister = router.transitionService.onBefore(
      { exiting: 'marketplace-offering-public' },
      async () => {
        try {
          await confirm(
            translate('Unsaved changes'),
            translate(
              'You have unsaved changes. If you leave this page, your changes will be lost.',
            ),
            {
              size: 'sm',
              positiveButtonVariant: 'warning',
              positiveButton: translate('Leave page'),
              negativeButton: translate('Stay'),
            },
          );
          return true;
        } catch {
          return false;
        }
      },
    );

    return () => {
      deregister();
    };
  }, [dirty, submitting, submitSucceeded, router, confirm]);

  return null;
};
