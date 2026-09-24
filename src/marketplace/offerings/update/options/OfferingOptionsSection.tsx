import { QuestionIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Tooltip } from 'waldur-ui';

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
          <Tooltip
            label={translate(
              'If you want user to provide additional details when ordering, please configure input form for the user below',
            )}
          >
            <QuestionIcon size={20} weight="bold" className="text-muted" />
          </Tooltip>
        </>
      }
      verboseName={translate('input variables')}
      offering={props.offering}
      refetch={props.refetch}
    />
  );
};
