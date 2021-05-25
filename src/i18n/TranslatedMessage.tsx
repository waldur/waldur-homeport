import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';

export const TranslatedMessage: FunctionComponent<{ domain: string }> = (
  props,
) => (ENV.translationDomain === props.domain ? <>{props.children}</> : null);
