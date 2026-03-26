import { expect, test, describe } from "bun:test";
import type { Lesson } from "./data/lesson";
import { ScheduleValidator } from "./schedule-validator";

describe("Валідація уроку", () => {
  test("Не повертає помилок для коректного уроку", () => {
    const validator = new ScheduleValidator();
    const lesson: Lesson = {
      id: 1,
      subject: "Проектування інформаційних систем",
      teacher: { id: 1, name: "Баранюк Олександр" },
      group: { id: 1, name: "КН-22" },
      dayOfWeek: 1,
      number: 1,
    };

    const result = validator.validateLesson(lesson);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("Повертає помилку для некоректного дня тижня", () => {
    const validator = new ScheduleValidator();
    const lesson: Lesson = {
      id: 2,
      subject: "Проектування інформаційних систем",
      teacher: { id: 2, name: "Баранюк Олександр" },
      group: { id: 2, name: "КН-22" },
      dayOfWeek: 7,
      number: 3,
    };

    const result = validator.validateLesson(lesson);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Invalid day of week. It should be between 1 and 6.",
    );
  });

  test("Повертає помилку для некоректного номера уроку", () => {
    const validator = new ScheduleValidator();
    const lesson: Lesson = {
      id: 4,
      subject: "Історія",
      teacher: { id: 3, name: "Mr. Brown" },
      group: { id: 3, name: "Група C" },
      dayOfWeek: 3,
      number: 7,
    };

    const result = validator.validateLesson(lesson);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Invalid lesson number. It should be between 1 and 6.",
    );
  });

  test("Повертає помилку для порожньої назви предмету", () => {
    const validator = new ScheduleValidator();
    const lesson: Lesson = {
      id: 3,
      subject: "   ",
      teacher: { id: 3, name: "Mr. Brown" },
      group: { id: 3, name: "Група C" },
      dayOfWeek: 3,
      number: 3,
    };

    const result = validator.validateLesson(lesson);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Subject is required.");
  });
});

describe("Виявлення конфліктів", () => {
  test("Повертає порожній масив для розкладу без конфліктів", () => {
    const validator = new ScheduleValidator();
    const lessons: Lesson[] = [
      {
        id: 1,
        subject: "Проектування інформаційних систем",
        teacher: { id: 1, name: "Баранюк Олександр" },
        group: { id: 1, name: "КН-22" },
        dayOfWeek: 1,
        number: 1,
      },
      {
        id: 2,
        subject: "Розробка веб додатків React.js",
        teacher: { id: 2, name: "Сурков Костянтин" },
        group: { id: 2, name: "КН-23" },
        dayOfWeek: 1,
        number: 2,
      },
    ];

    const conflicts = validator.detectConflicts(lessons);
    expect(conflicts).toHaveLength(0);
  });

  test("Повертає конфлікт для вчителів в один час", () => {
    const validator = new ScheduleValidator();
    const lessons: Lesson[] = [
      {
        id: 1,
        subject: "Проектування інформаційних систем",
        teacher: { id: 1, name: "Баранюк Олександр" },
        group: { id: 1, name: "КН-22" },
        dayOfWeek: 1,
        number: 1,
      },
      {
        id: 2,
        subject: "Розробка веб додатків React.js",
        teacher: { id: 1, name: "Баранюк Олександр" },
        group: { id: 2, name: "КН-23" },
        dayOfWeek: 1,
        number: 1,
      },
    ];

    const conflicts = validator.detectConflicts(lessons);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toContain("Teacher conflict detected at 1-1");
  });

  test("Повертає конфлікт для груп в один час", () => {
    const validator = new ScheduleValidator();
    const lessons: Lesson[] = [
      {
        id: 1,
        subject: "Проектування інформаційних систем",
        teacher: { id: 1, name: "Баранюк Олександр" },
        group: { id: 1, name: "КН-22" },
        dayOfWeek: 1,
        number: 1,
      },
      {
        id: 2,
        subject: "Розробка веб додатків React.js",
        teacher: { id: 2, name: "Сурков Костянтин" },
        group: { id: 1, name: "КН-22" },
        dayOfWeek: 1,
        number: 1,
      },
    ];

    const conflicts = validator.detectConflicts(lessons);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toContain("Group conflict detected at 1-1");
  });
});

describe("Розрахунок навантаження вчителя", () => {
  test("Повертає правильне навантаження для вчителя з уроком", () => {
    const validator = new ScheduleValidator();
    const lessons: Lesson[] = [
      {
        id: 1,
        subject: "Проектування інформаційних систем",
        teacher: { id: 1, name: "Баранюк Олександр" },
        group: { id: 1, name: "КН-22" },
        dayOfWeek: 1,
        number: 1,
      },
    ];

    const load = validator.calculateLoad(lessons, "Баранюк Олександр");
    expect(load).toBe(1);
  });

  test("Повертає правильне навантаження для вчителя з 20 уроками", () => {
    const validator = new ScheduleValidator();
    const lessons: Lesson[] = [];
    for (let i = 0; i < 20; i++) {
      lessons.push({
        id: i + 1,
        subject: `Предмет ${i + 1}`,
        teacher: { id: 1, name: "Баранюк Олександр" },
        group: { id: 1, name: "КН-22" },
        dayOfWeek: (i % 6) + 1,
        number: (i % 6) + 1,
      });
    }

    const load = validator.calculateLoad(lessons, "Баранюк Олександр");
    expect(load).toBe(20);
  });

  test("Викидає помилку для вчителя з надмірним навантаженням", () => {
    const validator = new ScheduleValidator();
    const lessons: Lesson[] = [];
    for (let i = 0; i < 21; i++) {
      lessons.push({
        id: i + 1,
        subject: `Предмет ${i + 1}`,
        teacher: { id: 1, name: "Баранюк Олександр" },
        group: { id: 1, name: "КН-22" },
        dayOfWeek: (i % 6) + 1,
        number: (i % 6) + 1,
      });
    }

    expect(() => {
      validator.calculateLoad(lessons, "Баранюк Олександр");
    }).toThrowError(
      "Teacher Баранюк Олександр has an excessive load of 21 lessons.",
    );
  });

  test("Викидає помилку для вчителя без уроків", () => {
    const validator = new ScheduleValidator();
    const lessons: Lesson[] = [
      {
        id: 1,
        subject: "Проектування інформаційних систем",
        teacher: { id: 1, name: "Баранюк Олександр" },
        group: { id: 1, name: "КН-22" },
        dayOfWeek: 1,
        number: 1,
      },
    ];

    expect(() => {
      validator.calculateLoad(lessons, "Сурков Костянтин");
    }).toThrowError(`Teacher Сурков Костянтин has no lessons assigned.`);
  });
});
