import { Offering } from 'waldur-js-client';

export interface OfferingSectionProps {
  offering: Offering;
  refetch;
  loading;
}
