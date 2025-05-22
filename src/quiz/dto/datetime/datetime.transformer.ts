import { DateTime } from 'luxon';
import { Valid } from 'luxon/src/_util';

export function toDateTime(value: any): DateTime<Valid> | null {
  const dt = DateTime.fromISO(value, { zone: 'utc' });
  return dt.isValid ? dt : null;
}
