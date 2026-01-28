export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {}
) {
  if (!date) return '';

  try {
    return new Intl.DateTimeFormat('en-US', {
      month: opts.month ?? 'short',
      day: opts.day ?? 'numeric',
      year: opts.year ?? 'numeric',
      hour: opts.hour ?? (opts.hour12 !== undefined ? '2-digit' : undefined),
      minute: opts.minute ?? (opts.hour12 !== undefined ? '2-digit' : undefined),
      hour12: opts.hour12 ?? (opts.hour !== undefined ? true : undefined),
      timeZone: 'Asia/Kolkata',
      ...opts
    }).format(new Date(date)) + (opts.hour !== undefined ? ' IST' : '');
  } catch (_err) {
    return '';
  }
}
