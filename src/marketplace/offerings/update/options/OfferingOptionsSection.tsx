import { QuestionIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { OfferingSectionProps } from '../types';

import { OfferingOptionsSectionPure } from './OfferingOptionsSectionPure';

export const OfferingOptionsSection: FC<OfferingSectionProps> = (props) => {
  return (
    <OfferingOptionsSectionPure
      type="options"
      title={
        <>
          {translate('User input')}{' '}
          <Tip
            id="form-field-tooltip"
            label={translate(
              'If you want user to provide additional details when ordering, please configure input form for the user below',
            )}
            className="mx-2 text-muted"
          >
            <QuestionIcon size={24} weight="fill" />
          </Tip>
        </>
      }
      offering={props.offering}
      refetch={props.refetch}
      loading={props.loading}
    />
  );
};
