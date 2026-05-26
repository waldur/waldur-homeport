import { QuestionIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';

import { Badge } from '@/core/Badge';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

interface InvitationStatusBadgeProps {
  status: string;
  statusDisplay: string;
}

export const InvitationStatusBadge: FC<InvitationStatusBadgeProps> = ({
  status,
  statusDisplay,
}) => {
  const variant = useMemo(() => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'pending':
        return 'warning';
      case 'declined':
        return 'danger';
      case 'expired':
        return 'secondary';
      default:
        return 'primary';
    }
  }, [status]);

  return (
    <Badge
      variant={variant}
      rightIcon={
        status === 'pending' ? (
          <Tip
            id={`pending-info-${statusDisplay}`}
            label={translate(
              'This reviewer has not yet accepted the invitation or created a profile.',
            )}
          >
            <QuestionIcon size={14} weight="bold" />
          </Tip>
        ) : undefined
      }
      pill
      outline
    >
      {statusDisplay}
    </Badge>
  );
};
