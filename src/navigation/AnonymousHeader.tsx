import { FunctionComponent } from 'react';

import './AnonymousHeader.scss';
import { translate } from '@waldur/i18n';
import { Button } from '@waldur/marketplace/offerings/service-providers/shared/Button';
import { InputField } from '@waldur/marketplace/offerings/service-providers/shared/InputField';
import { AnonymousLanguageSelector } from '@waldur/navigation/AnonymousLanguageSelector';
import { router } from '@waldur/router';

export const AnonymousHeader: FunctionComponent = () => (
  <div className="anonymousHeader white-bg">
    <InputField
      name="name"
      placeholder={translate('Search for offerings and providers')}
    />
    <div className="anonymousHeader__actions">
      <AnonymousLanguageSelector />
      <Button
        label={translate('Log in')}
        onClick={() => router.stateService.go('login')}
      />
    </div>
  </div>
);
