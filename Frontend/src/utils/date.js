/**
 * Convert { day, time } → Date
 * Supports flexible input:
 * day: "Sunday" | "sunday"
 * time: "07:30 PM" | "7:30PM"
 */
export const buildDateFromDayTime = ({ day, time }) => {
  if (typeof day !== "string" || typeof time !== "string") return null;

  const dayMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const targetDay = dayMap[day.toLowerCase()];
  if (targetDay === undefined) return null;

  const match = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return null;

  let [, h, m, mod] = match;
  let hours = Number(h);
  let minutes = Number(m);

  if (mod.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (mod.toUpperCase() === "AM" && hours === 12) hours = 0;

  const date = new Date();
  const diff = (targetDay - date.getDay() + 7) % 7;

  date.setDate(date.getDate() + diff);
  date.setHours(hours, minutes, 0, 0);

  if (date < new Date()) {
    date.setDate(date.getDate() + 7);
  }

  return date;
};
