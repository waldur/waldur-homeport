import { formatCrontab } from './crontab';

describe('formatCrontab', () => {
  it('formats schedule for every minute', () => {
    expect(formatCrontab('* * * * *')).toBe('Every minute');
  });

  it('formats schedule for every hour', () => {
    expect(formatCrontab('0 * * * *')).toBe('Every hour');
  });

  it('formats schedule for every hour at x minutes', () => {
    expect(formatCrontab('30 * * * *')).toBe('Every hour at 30 past the hour');
  });

  it('formats schedule for every day', () => {
    expect(formatCrontab('0 0 * * *')).toBe('Every day at 00:00');
  });

  it('formats schedule for every week', () => {
    expect(formatCrontab('0 0 * * 0')).toBe('Every week on Sunday at 00:00');
  });

  it('formats schedule for every month', () => {
    expect(formatCrontab('0 0 1 * *')).toBe('Every month on the 1st at 00:00');
  });

  it('formats schedule for every year', () => {
    expect(formatCrontab('0 0 1 1 *')).toBe('Every month on the 1st of January at 00:00');
  });
});
