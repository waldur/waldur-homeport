import { ArrowsClockwiseIcon, WarningIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { marketplaceDemoPresetsLoad } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { startDemoReset } from './resetState';

interface LoadDemoPresetButtonProps {
  name: string;
  title: string;
  /** Called once the load has started, before the reset overlay shows. */
  onStarted?: () => void;
  size?: 'sm' | 'md';
}

/**
 * Loads a preset in the background, after the staff user types its name. A
 * load deletes every organization, project, offering and account, the
 * caller's included, so the confirmation says so.
 */
export const LoadDemoPresetButton: FC<LoadDemoPresetButtonProps> = ({
  name,
  title,
  onStarted,
  size,
}) => {
  const { confirm } = useModal();
  const { showError, showErrorResponse } = useNotify();

  const mutation = useMutation({
    mutationFn: () =>
      marketplaceDemoPresetsLoad({
        path: { name },
        body: { cleanup_first: true },
      }).then(({ data }) => data),
    onSuccess: () => {
      onStarted?.();
      startDemoReset(name);
    },
    onError: (error) => {
      showErrorResponse(
        error,
        translate('Unable to load the demo preset {name}.', { name }),
      );
    },
  });

  const load = async () => {
    let typed: string;
    try {
      // With `showInput`, confirm resolves with `{ input }`.
      const result = await confirm(
        translate('Load the demo preset {title}?', { title }),
        <>
          <p className="font-medium text-danger">
            {translate(
              'Loading a preset deletes every organization, project, offering, user and API token in this portal, and replaces them with the preset’s.',
            )}
          </p>
          <p>
            {translate(
              'Everyone is signed out, you included. While the preset loads, the portal is unavailable; then it opens the sign-in page.',
            )}
          </p>
          <p className="mb-0">
            {translate('Type "{text}" to confirm:', { text: name })}
          </p>
        </>,
        {
          type: 'danger',
          iconNode: <WarningIcon weight="bold" />,
          positiveButton: translate('Load preset'),
          negativeButton: translate('Cancel'),
          positiveButtonVariant: 'danger',
          showInput: true,
          inputRequired: true,
          inputPlaceholder: name,
        },
      );
      typed = (result as { input?: string } | undefined)?.input ?? '';
    } catch {
      return; // Cancelled.
    }
    if (typed.trim() !== name) {
      showError(
        translate('Confirmation text does not match. Expected "{text}"', {
          text: name,
        }),
      );
      return;
    }
    mutation.mutate();
  };

  return (
    <BaseButton
      variant="danger"
      size={size}
      onClick={load}
      disabled={mutation.isPending}
      disabledReason={translate('The load is starting')}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      label={translate('Load')}
      data-testid={`load-demo-preset-${name}`}
    />
  );
};
