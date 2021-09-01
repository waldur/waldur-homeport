import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { CustomersDivisionsChart } from '@waldur/customer/divisions/CustomersDivisionsChart';
import { CustomersDivisionsFilter } from '@waldur/customer/divisions/CustomersDivisionsFilter';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

export const CustomersDivisionsContainer: FunctionComponent = () => {
  useTitle(translate('Organizations divisions'));
  const router = useRouter();
  if (!ENV.FEATURES.SUPPORT.CUSTOMERS_LIST) {
    router.stateService.go('errorPage.notFound');
  }
  return (
    <>
      <CustomersDivisionsFilter />
      <CustomersDivisionsChart />
    </>
  );
};
