import { TranslateProps } from '@waldur/i18n';
import { BaseResource } from '@waldur/resource/types';

export interface ResourceSummaryProps<T extends BaseResource = any> extends TranslateProps {
  resource: T;
}
