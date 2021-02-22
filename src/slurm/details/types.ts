export interface Period {
  month: number;
  year: number;
}

export interface Usage extends Period {
  cpu_usage: number;
  gpu_usage: number;
  ram_usage: number;
}

export interface UserUsage extends Usage {
  username: string;
  full_name: string;
}
