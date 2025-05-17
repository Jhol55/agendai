import { type ClassValue, clsx } from "clsx"
import { eachDayOfInterval, eachHourOfInterval, eachMonthOfInterval, eachWeekOfInterval, endOfDay, endOfMonth, endOfYear, format, differenceInDays, getWeekOfMonth, isSameDay, isSameMonth, isSameWeek, isWithinInterval, startOfDay, startOfMonth, startOfYear, differenceInCalendarDays, getMonth, differenceInCalendarWeeks } from "date-fns";
import { DateRange } from "react-day-picker";
import { twMerge } from "tailwind-merge"
import { Appointment } from "@/models/Appointment";
import { ptBR } from 'date-fns/locale';
import { UpdatedBlockTimeSlotsProps } from "@/models/BlockTimeSlots";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateNewDates = (viewMode: string, index: number, currentIndex: number, dateRange: DateRange) => {
  let start = new Date(dateRange.from as Date);
  let end = new Date(dateRange.to as Date);
  const delta = (currentIndex - index) * -1;
  switch (viewMode) {
    case "day":
      start.setHours(start.getHours() + delta);
      end.setHours(end.getHours() + delta);
      break;
    case "week":
      start.setDate(start.getDate() + delta);
      end.setDate(end.getDate() + delta);
      break;
    case "month":
      start.setDate(start.getDate() + delta);
      end.setDate(end.getDate() + delta);
      break;
    case "year":
      start = new Date(dateRange.from as Date);
      start.setMonth(index);
      end = new Date(start);
      end.setMonth(start.getMonth() + 1);
      break;
  }
  return { start, end };
};


export const filterAppointments = (
  appt: Appointment | UpdatedBlockTimeSlotsProps,
  index: number,
  dateRange: DateRange | undefined,
  viewMode: string,
): boolean => {
  const apptDate = new Date(appt.start);
  if (
    !dateRange?.from ||
    !dateRange?.to ||
    !isWithinInterval(apptDate, { start: dateRange.from, end: dateRange.to })
  ) {
    return false;
  }
  return isAppointmentInSlot(apptDate, index, viewMode, dateRange);
};
// Helper function to determine if an appointment should be displayed in a specific slot
const isAppointmentInSlot = (
  apptDate: Date,
  index: number,
  viewMode: string,
  dateRange: DateRange,
): boolean => {
  if (!dateRange.from) return false;

  switch (viewMode) {
    case "day":
      return (
        apptDate.getHours() === index && isSameDay(apptDate, dateRange.from)
      );
    case "week":
      return (
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        apptDate.getDay() - (6 - differenceInDays(new Date(dateRange.to!), new Date(dateRange.from))) === index &&
        isSameWeek(apptDate, dateRange.from)
      );
    case "month":
      return (
        differenceInCalendarWeeks(apptDate, startOfMonth(apptDate)) === index && 
        isSameMonth(apptDate, dateRange.from)
      );
    case "year":
      return apptDate.getMonth() === index;
    default:
      return false;
  }
};

export const getLabelsForView = (
  viewMode: 'day' | 'week' | 'month' | 'year',
  dateRange: { start: Date; end: Date }
): string[] => {
  switch (viewMode) {
    case 'day':
      return eachHourOfInterval({ start: startOfDay(dateRange.start), end: endOfDay(dateRange.end) })
        .map(hour => format(hour, 'HH:mm', { locale: ptBR }));
    case 'week':
      return eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
        .map(day => `${format(day, 'EEEE', { locale: ptBR })}, ${format(day, 'd', { locale: ptBR })}`);
    case 'month':
      return eachWeekOfInterval({ start: startOfMonth(dateRange.start), end: endOfMonth(dateRange.end) })
        .map((week, index) => `${index + 1}ª semana de ${format(dateRange.start, 'MMMM', { locale: ptBR })}`);
    case 'year':
      return eachMonthOfInterval({ start: startOfYear(dateRange.start), end: endOfYear(dateRange.end) })
        .map(month => format(month, 'MMMM', { locale: ptBR }));
    default:
      return [];
  }
};




export function getMinMaxCalendarRange(
  schedules: { start_time?: string | Date, end_time?: string | Date, start?: string | Date, end?: string | Date }[]
) {
  
  if (schedules.length === 0) {
    return { min: null, max: null };
  }
  
  function updateDatesToToday(dates: string[]) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
  
    return dates.map(dateStr => { 
      const [_, time] = dateStr.split(',').map(s => s.trim());
      return `${year}/${month}/${day}, ${time}`;
    });
  }

  const normalizedStart = updateDatesToToday(schedules.map(s => new Date(s.start_time ?? s.start ?? "")?.toLocaleString()));
  const normalizedEnd = updateDatesToToday(schedules.map(s => new Date(s.end_time ?? s.end ?? "")?.toLocaleString()));

  const startTimes = normalizedStart
    .map(s => new Date(s).getTime())
    .filter(time => !isNaN(time));

  const endTimes = normalizedEnd
    .map(s => new Date(s).getTime())
    .filter(time => !isNaN(time));

  if (startTimes.length === 0 || endTimes.length === 0) {
    return { min: null, max: null };
  }

  const min = new Date(Math.min(...startTimes));
  const max = new Date(Math.max(...endTimes));

  return { min, max };
}


export function parseSafeDate(value: unknown): Date | undefined {
  const date = typeof value === "string" || value instanceof Date ? new Date(value) : undefined;
  return date instanceof Date && !isNaN(date.getTime()) ? date : undefined;
}