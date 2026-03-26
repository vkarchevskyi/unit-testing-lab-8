import type { DayOfWeek } from "./day-of-week";
import type { Group } from "./group";
import type { Subject } from "./subject";
import type { Teacher } from "./teacher";

export type Lesson = {
  id: number;
  teacher: Teacher;
  subject: Subject;
  group: Group;
  number: number;
  dayOfWeek: DayOfWeek;
};
