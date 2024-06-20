import { useEffect } from 'react';
import './LandingPage.css';

import { CookiesConsent } from '@waldur/navigation/cookies/CookiesConsent';

import { AuthService } from './AuthService';
import { HeroColumn } from './HeroColumn';
import { LoginColumn } from './LoginColumn';

export const LandingPage = () => {
  useEffect(() => AuthService.storeRedirect(), []);

  return (
    <>
      <CookiesConsent />
      <div className="landing-page">
        <LoginColumn />
        <HeroColumn />
      </div>
    </>
  );
};
