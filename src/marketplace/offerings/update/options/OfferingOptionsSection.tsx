import { FC } from 'react';

import { HelpIcon } from 'waldur-ui';

import { translate } from '@/i18n';

import { OfferingSectionProps } from '../types';

import { OfferingOptionsSectionPure } from './OfferingOptionsSectionPure';

export const OfferingOptionsSection: FC<OfferingSectionProps> = (props) => {
  return (
    <OfferingOptionsSectionPure
      type="options"
      title={
        <>
          {translate('User input')}{' '}
          <HelpIcon
            label={translate(
              'If you want user to provide additional details when ordering, please configure input form for the user below',
            )}
            size={20}
          />
        </>
      }
      verboseName={translate('input variables')}
      offering={props.offering}
      refetch={props.refetch}
    />
  );
};
