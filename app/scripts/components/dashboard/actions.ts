import { FeedItem, Project } from "@waldur/dashboard/types";

const FETCH_ALERTS_FEED = 'waldur/alerts_feed/FETCH';
const FETCH_EVENTS_FEED = 'waldur/events_feed/FETCH';

const fetchAlertsFeed = (project: Project) => ({
  type: FETCH_ALERTS_FEED,
  project,
});

const fetchEventsFeed = (project: Project) => ({
  type: FETCH_EVENTS_FEED,
  project,
});

export {
  FETCH_ALERTS_FEED,
  FETCH_EVENTS_FEED,

  fetchAlertsFeed,
  fetchEventsFeed,
};
