export interface Component {
  type: string;
  name: string;
  description: string;
  usage: number;
  limit: number | null;
}

export interface AggregateLimitStatsResponse {
  components: Component[];
}
