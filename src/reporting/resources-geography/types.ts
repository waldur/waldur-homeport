import { CountStats, OfferingCountryStats } from 'waldur-js-client';

export interface ResourcesGeographyStats {
  byCountry: OfferingCountryStats[];
  byOrgGroup: CountStats[];
}

export interface ResourcesGeographySummary {
  totalResources: number;
  countriesWithResources: number;
  orgGroupsWithResources: number;
  offeringsWithResources: number;
}
