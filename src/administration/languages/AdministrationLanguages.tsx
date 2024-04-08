import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

import LanguageOptionsForm from './LanguageOptionsForm';

export const AdministrationLanguages: FunctionComponent = () => {
  const languageChoices = ENV.languageChoices;

  return (
    <Card>
      <Card.Header>
        <Card.Title>{translate('Language options')}</Card.Title>
      </Card.Header>

      <Card.Body>
        <LanguageOptionsForm languageChoices={languageChoices} />
      </Card.Body>
    </Card>
  );
};
