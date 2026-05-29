import type { OpeningHours } from "@/lib/types";

export const DEFAULT_OPENING_HOURS: OpeningHours = {
  mon: { active: true, open: "08:00", close: "18:00" },
  tue: { active: true, open: "08:00", close: "18:00" },
  wed: { active: true, open: "08:00", close: "18:00" },
  thu: { active: true, open: "08:00", close: "18:00" },
  fri: { active: true, open: "08:00", close: "18:00" },
  sat: { active: false, open: "08:00", close: "12:00" },
  sun: { active: false, open: "08:00", close: "12:00" },
};
