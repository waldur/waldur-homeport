import { FilteredEventsButton } from '@waldur/events/FilteredEventsButton';
import { Offering } from '@waldur/marketplace/types';
export const TosHistoryLogButton = ({
  offering,
  asDropdownItem,
}: {
  offering: Offering;
  asDropdownItem?: boolean;
}) => {
  return (
    <FilteredEventsButton
      filter={{
        scope: offering?.url,
        feature: ['terms_of_service'],
      }}
      asDropdownItem={asDropdownItem}
    />
  );
};
