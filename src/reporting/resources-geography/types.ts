import {
  CountStats,
  OfferingCountryStats,
  OfferingStats,
} from 'waldur-js-client';

export interface ResourcesGeographyStats {
  byOffering: OfferingStats[];
  byCountry: OfferingCountryStats[];
  byOrgGroup: CountStats[];
}

export interface ResourcesGeographySummary {
  totalResources: number;
  countriesWithResources: number;
  orgGroupsWithResources: number;
  offeringsWithResources: number;
}
