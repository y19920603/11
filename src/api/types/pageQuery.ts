export interface PageQuery {
  start: number;
  length: number;
  sort: string;
  sort_dir: number;
}

export interface DateTimeQuery {
  start_datetime: string;
  end_datetime: string;
}

export interface DateTimeModelQuery extends DateTimeQuery {
  date_mode?: string | null;
}

export interface PageResultVO<TData = any, TInput = any | null, TSummary = any | null> {
  data: TData;
  input: TInput;
  summary: TSummary;
  records_total: number;
  result: boolean;
  scheduled_shutdown_time: string;
}

export interface RecordResultVO<TData = any> {
  result: boolean;
  msg: string;
  data: TData;
}
