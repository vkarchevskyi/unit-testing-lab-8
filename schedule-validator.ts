import type { Teacher } from "./data/teacher";
import type { Group } from "./data/group";
import type { Lesson } from "./data/lesson";

export class ScheduleValidator {
  validateLesson(lesson: Lesson): { valid: boolean; errors: string[] } {
    const { number, dayOfWeek, subject } = lesson;
    const errors: string[] = [];

    if (dayOfWeek < 1 || dayOfWeek > 6) {
      errors.push("Invalid day of week. It should be between 1 and 6.");
    }

    if (number < 1 || number > 6) {
      errors.push("Invalid lesson number. It should be between 1 and 6.");
    }

    if (subject.trim() === "") {
      errors.push("Subject is required.");
    }

    return { valid: errors.length === 0, errors };
  }

  detectConflicts(lessons: Lesson[]): string[] {
    const conflicts: string[] = [];
    const teacherMap: Record<string, Teacher[]> = {};
    const groupMap: Record<string, Group[]> = {};

    for (const lesson of lessons) {
      const key = `${lesson.dayOfWeek}-${lesson.number}`;
      if (!teacherMap[key]) {
        teacherMap[key] = [];
      }
      if (!groupMap[key]) {
        groupMap[key] = [];
      }

      teacherMap[key].push(lesson.teacher);
      groupMap[key].push(lesson.group);
    }

    for (const key in teacherMap) {
      const teachersAtTime = teacherMap[key];
      const uniqueTeachers = new Set(teachersAtTime.map((t) => t.id));
      if (uniqueTeachers.size < teachersAtTime.length) {
        conflicts.push(`Teacher conflict detected at ${key}`);
      }
    }

    for (const key in groupMap) {
      const groupsAtTime = groupMap[key];
      const uniqueGroups = new Set(groupsAtTime.map((g) => g.id));
      if (uniqueGroups.size < groupsAtTime.length) {
        conflicts.push(`Group conflict detected at ${key}`);
      }
    }

    return conflicts;
  }

  calculateLoad(lessons: Lesson[], teacher: Teacher): number {
    const teacherLessonsQuantity = lessons.filter(
      (lesson) => lesson.teacher.id === teacher.id,
    ).length;

    if (teacherLessonsQuantity > 20) {
      throw new Error(
        `Teacher ${teacher.name} has an excessive load of ${teacherLessonsQuantity} lessons.`,
      );
    }

    if (teacherLessonsQuantity <= 0) {
      throw new Error(`Teacher ${teacher.name} has no lessons assigned.`);
    }

    return teacherLessonsQuantity;
  }
}
