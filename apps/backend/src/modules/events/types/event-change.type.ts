export interface EventComparableSnapshot {
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string;
  capacity: number;
  status: string;
}

export interface ChangedFieldDetail {
  before: string | number | null;
  after: string | number | null;
}

export type ChangedFieldsMap = Record<string, ChangedFieldDetail>;
