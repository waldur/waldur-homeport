import { isFeatureVisible } from '@/features/connect';
import { InvitationsFeatures } from '@/FeaturesEnums';
import { DialogSizeType } from '@/modal/types';

// The invitee table needs the extra width only for the civil number column.
export const getInvitationDialogSize = (): DialogSizeType =>
  isFeatureVisible(InvitationsFeatures.conceal_civil_number) ? 'lg' : 'xl';
