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
 * Asks the fit question where it is actually asked — on the offering — handing
 * the assistant that offering as an editable first message, not a sent one.
 */
export const AskAboutOfferingButton: FC<{ offering: Offering }> = ({
  offering,
}) => {
  const user = useUser();
  const { openDrawer } = useDrawer();

  if (!isAssistantEnabled(user)) {
    return null;
  }

  // `customer_name` is nullable on Offering, and the interpolator stringifies
  // whatever it is handed — an absent provider would otherwise reach the model
  // as the literal word "null".
  const seedPrompt = offering.customer_name
    ? translate(
        'Tell me about {offering} by {organization}. Is this service right for me?',
        { offering: offering.name, organization: offering.customer_name },
      )
    : translate('Tell me about {offering}. Is this service right for me?', {
        offering: offering.name,
      });

  const handleClick = () => openUnifiedChatDrawer(openDrawer, { seedPrompt });

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
