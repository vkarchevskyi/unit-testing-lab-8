import type { DayOfWeek } from "./day-of-week";
import type { Group } from "./group";
import type { Teacher } from "./teacher";

export type Lesson = {
  id: number;
  teacher: Teacher;
  subject: string;
  group: Group;
  number: number;
  dayOfWeek: DayOfWeek;
};
