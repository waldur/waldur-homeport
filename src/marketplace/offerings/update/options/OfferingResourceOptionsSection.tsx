import { FC } from 'react';

import { HelpIcon } from 'waldur-ui';

import { translate } from '@/i18n';

import { OfferingSectionProps } from '../types';

import { OfferingOptionsSectionPure } from './OfferingOptionsSectionPure';

export const OfferingResourceOptionsSection: FC<OfferingSectionProps> = (
  props,
) => {
  return (
    <OfferingOptionsSectionPure
      type="resource_options"
      title={
        <>
          {translate('Resource options')}{' '}
          <HelpIcon
            label={translate(
              'If you want user to be able to modify resource options after creation, please configure options for user below',
            )}
            size={20}
          />
        </>
      }
      verboseName={translate('resource options')}
      offering={props.offering}
      refetch={props.refetch}
    />
  );
};
