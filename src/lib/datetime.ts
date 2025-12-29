import dayjs from 'dayjs';

export enum DateFormat {
  'YYYY-MM-DD hh:mm',
  'YYYY-MM-DD',
  'YY-MM-DD',
  'HH:mm',
}

export const parseDate = (time: string | number | Date | undefined, format: keyof typeof DateFormat) =>
  time ? dayjs(time).format(format) : '';
