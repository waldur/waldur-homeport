import { TranslateProps } from '@waldur/i18n';
import { Resource } from '@waldur/resource/types';

export interface ResourceSummaryProps<T extends Resource = any>
  extends TranslateProps {
  resource: T;
  hideBackendId?: boolean;
}
