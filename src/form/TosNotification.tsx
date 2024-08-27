import { Link } from '@waldur/core/Link';
import { formatJsx, translate } from '@waldur/i18n';

export const TosNotification = ({
  className = 'text-center fs-9 mt-2 mb-0',
}) => (
  <p className={className}>
    {translate(
      'By ordering, you agree to the platform <tos>terms of service</tos> and <pp>privacy policy</pp>.',
      {
        tos: (s: string) => <Link state="about.tos" label={s} />,
        pp: (s: string) => <Link state="about.privacy" label={s} />,
      },
      formatJsx,
    )}
  </p>
);
