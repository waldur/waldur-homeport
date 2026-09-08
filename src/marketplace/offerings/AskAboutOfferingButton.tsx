import { SparkleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Offering } from 'waldur-js-client';

import { isAssistantEnabled } from '@/ai-assistant/utils';
import { openUnifiedChatDrawer } from '@/chat/openUnifiedChatDrawer';
import { useDrawer } from '@/drawer/actions';
import { translate } from '@/i18n';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';

/**
 * Offering-page entry point to the assistant. Deciding whether a service fits
 * is exactly the question the assistant answers, and it is asked here — on the
 * offering being weighed up — rather than in a header icon that carries no
 * context. Opening from here hands the assistant the offering and its provider
 * as an editable first question, so the visitor can refine it before sending.
 */
export const AskAboutOfferingButton: FC<{ offering: Offering }> = ({
  offering,
}) => {
  const user = useUser();
  const { openDrawer } = useDrawer();

  if (!isAssistantEnabled(user)) {
    return null;
  }

  const handleClick = () =>
    openUnifiedChatDrawer(openDrawer, {
      seedPrompt: translate(
        'Tell me about {offering} by {organization}. Is this service right for me?',
        { offering: offering.name, organization: offering.customer_name },
      ),
    });

  return (
    <ActionButton
      title={translate('Ask about this service')}
      iconNode={<SparkleIcon weight="bold" />}
      variant="secondary"
      action={handleClick}
      data-testid="offering-ask-assistant"
    />
  );
};
