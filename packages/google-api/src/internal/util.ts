import { getColorByCode } from '@mznpm/data-util';
import { sheets_v4 } from 'googleapis';

export const code2Color = (code?: string): sheets_v4.Schema$Color | undefined => {
  if (!code) {
    return undefined;
  }

  const color = getColorByCode(code);
  return {
    red: color.red / 255,
    green: color.green / 255,
    blue: color.blue / 255,
    alpha: color.alpha / 255,
  };
};
