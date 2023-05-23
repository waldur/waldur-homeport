import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { formatJsx, translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import { Field } from '@waldur/resource/summary';

const OrganizationGroupsDetailsDialog = lazyComponent(
  () => import('./OrganizationGroupsDetailsDialog'),
  'OrganizationGroupsDetailsDialog',
);

const showOrganizationGroups = (organizationGroups) =>
  openModalDialog(OrganizationGroupsDetailsDialog, {
    resolve: { organizationGroups },
  });

export const ProviderOfferingAccessField = ({
  offering,
}: {
  offering: Offering;
}) => {
  const dispatch = useDispatch();
  return (
    <Field label={translate('Access') + ':'} spaceless>
      {offering?.divisions?.length
        ? translate(
            'Restricted (<orgGroups>organization groups</orgGroups>)',
            {
              orgGroups: (s: string) => (
                <a
                  className="text-link"
                  onClick={() =>
                    dispatch(showOrganizationGroups(offering.divisions))
                  }
                >
                  {s}
                </a>
              ),
            },
            formatJsx,
          )
        : translate('Public')}
    </Field>
  );
};
