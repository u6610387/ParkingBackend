export function assertTimeRange(startTime, endTime) {
  const s = new Date(startTime);
  const e = new Date(endTime);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
    const err = new Error("Invalid startTime/endTime"); err.status = 400; throw err;
  }
  if (e <= s) { const err = new Error("endTime must be after startTime"); err.status = 400; throw err; }
  return { s, e };
}