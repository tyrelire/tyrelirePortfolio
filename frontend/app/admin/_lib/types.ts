export type Experience = {
  id: number;
  company: string;
  role: string;
  timeframe: string;
  achievements: string[];
  order: number;
};

export type Education = {
  id: number;
  institution: string;
  date: string;
  description: string;
  order: number;
};

export type Skill = {
  id: number;
  title: string;
  description: string;
  iconName: string | null;
  order: number;
};

export type AboutIntro = {
  title: string;
  display: boolean;
  description: string;
};

export type AboutProfile = {
  avatar: string;
  location: string;
  languages: string[];
};

export type AvatarHistoryItem = {
  id: string;
  url: string;
  createdAt: string;
};

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "NEW" | "READ";
  createdAt: string;
  updatedAt: string;
  ip: string | null;
  userAgent: string | null;
};

export type ExperienceForm = {
  company: string;
  role: string;
  timeframe: string;
  achievementsText: string;
  order: number;
};

export type EducationForm = {
  institution: string;
  date: string;
  description: string;
  order: number;
};

export type SkillForm = {
  title: string;
  description: string;
  iconName: string;
  order: number;
};
