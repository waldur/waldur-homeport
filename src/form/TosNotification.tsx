import { Link } from '@/core/Link';
import { formatJsx, translate } from '@/i18n';

export const TosNotification = ({
  className = 'text-center text-quinary text-sm mt-1.5 mb-0',
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
