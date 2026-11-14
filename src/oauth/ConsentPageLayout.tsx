import { FC, PropsWithChildren } from 'react';

import { AuthHeaderControls } from '@/auth/AuthHeaderControls';
import { getIconUrl } from '@/core/api';
import { ENV } from '@/core/config';
import { LanguageSelectorBox } from '@/i18n/LanguageSelectorBox';
import { CookiesConsent } from '@/navigation/cookies/CookiesConsent';
import { FooterLinks } from '@/navigation/footer/FooterLinks';

/**
 * The consent page's own frame, like the sign-in page the user may have just
 * left. The app's sidebar and header have nothing to offer while an app waits
 * for an answer.
 */
export const ConsentPageLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="flex min-h-screen flex-col overflow-x-clip bg-secondary">
    <CookiesConsent />
    {/* On phones the logo gets its own row: between the controls it is pushed
        off-centre by the language picker, more so for a long language name. */}
    <div className="grid grid-cols-2 items-center gap-y-4 p-4 sm:grid-cols-[1fr_auto_1fr] sm:gap-y-0">
      <div className="justify-self-start">
        <LanguageSelectorBox />
      </div>
      <img
        alt={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
        src={getIconUrl('login_logo')}
        className="col-span-2 row-start-2 h-6 w-auto justify-self-center sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:h-8"
      />
      <div className="col-start-2 row-start-1 justify-self-end sm:col-start-3">
        <AuthHeaderControls />
      </div>
    </div>
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[560px]">{children}</div>
    </main>
    <footer className="flex items-center justify-between border-t border-secondary px-8 py-4">
      <FooterLinks />
    </footer>
  </div>
);
