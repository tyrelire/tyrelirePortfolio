import type {
  AboutIntro,
  AboutProfile,
  EducationForm,
  ExperienceForm,
  SkillForm,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export const BACKEND_RETRY_MS = 2000;

export const inputClass = "border rounded-md px-3 py-2 bg-transparent";

export const panelClass =
  "rounded-2xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-sm";

export const emptyExperienceForm: ExperienceForm = {
  company: "",
  role: "",
  timeframe: "",
  achievementsText: "",
  order: 0,
};

export const emptyEducationForm: EducationForm = {
  institution: "",
  date: "",
  description: "",
  order: 0,
};

export const emptySkillForm: SkillForm = {
  title: "",
  description: "",
  iconName: "",
  order: 0,
};

export const emptyIntroForm: AboutIntro = {
  title: "Introduction",
  display: true,
  description: "",
};

export const emptyProfileForm: AboutProfile = {
  avatar: "/jester-pp.webp",
  location: "Europe/Paris",
  languages: ["French", "English"],
};
