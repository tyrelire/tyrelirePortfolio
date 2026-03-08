import { useCallback } from "react";
import { apiRequest } from "../_lib/api";
import {
  emptyEducationForm,
  emptyExperienceForm,
  emptySkillForm,
} from "../_lib/constants";
import { toTrimmedLines } from "../_lib/helpers";
import type {
  AboutIntro,
  AboutProfile,
  Education,
  EducationForm,
  Experience,
  ExperienceForm,
  Skill,
  SkillForm,
} from "../_lib/types";

type Params = {
  introForm: AboutIntro;
  profileForm: AboutProfile;
  experienceForm: ExperienceForm;
  educationForm: EducationForm;
  skillForm: SkillForm;
  editingExperienceId: number | null;
  editingEducationId: number | null;
  editingSkillId: number | null;
  setError: (value: string | null) => void;
  setMessage: (value: string | null) => void;
  refresh: () => Promise<boolean>;
  setExperienceForm: (value: ExperienceForm) => void;
  setEducationForm: (value: EducationForm) => void;
  setSkillForm: (value: SkillForm) => void;
  setEditingExperienceId: (value: number | null) => void;
  setEditingEducationId: (value: number | null) => void;
  setEditingSkillId: (value: number | null) => void;
};

export function useAboutAdminActions(p: Params) {
  const withRefresh = useCallback(
    async (action: () => Promise<void>, okMessage: string) => {
      p.setError(null);
      p.setMessage(null);
      try {
        await action();
        p.setMessage(okMessage);

        const scrollY = window.scrollY;
        await p.refresh();
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: scrollY, behavior: "auto" });
        });
      } catch (err) {
        p.setError(err instanceof Error ? err.message : "Request failed");
      }
    },
    [p],
  );

  const saveIntro = () =>
    withRefresh(async () => {
      await apiRequest<AboutIntro>("/api/about/intro", {
        method: "PUT",
        body: JSON.stringify(p.introForm),
      });
    }, "Introduction updated");

  const saveProfile = () =>
    withRefresh(async () => {
      await apiRequest<AboutProfile>("/api/about/profile", {
        method: "PUT",
        body: JSON.stringify({
          avatar: p.profileForm.avatar,
          location: p.profileForm.location,
          languages: p.profileForm.languages
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });
    }, "Profile updated");

  const saveExperience = () =>
    withRefresh(
      async () => {
        const payload = {
          company: p.experienceForm.company,
          role: p.experienceForm.role,
          timeframe: p.experienceForm.timeframe,
          achievements: toTrimmedLines(p.experienceForm.achievementsText),
          order: Number(p.experienceForm.order),
        };

        const route =
          p.editingExperienceId === null
            ? "/api/about/experiences"
            : `/api/about/experiences/${p.editingExperienceId}`;
        await apiRequest<Experience>(route, {
          method: p.editingExperienceId === null ? "POST" : "PUT",
          body: JSON.stringify(payload),
        });

        p.setEditingExperienceId(null);
        p.setExperienceForm(emptyExperienceForm);
      },
      p.editingExperienceId === null
        ? "Experience created"
        : "Experience updated",
    );

  const saveEducation = () =>
    withRefresh(
      async () => {
        const payload = {
          institution: p.educationForm.institution,
          date: p.educationForm.date,
          description: p.educationForm.description,
          order: Number(p.educationForm.order),
        };

        const route =
          p.editingEducationId === null
            ? "/api/about/education"
            : `/api/about/education/${p.editingEducationId}`;
        await apiRequest<Education>(route, {
          method: p.editingEducationId === null ? "POST" : "PUT",
          body: JSON.stringify(payload),
        });

        p.setEditingEducationId(null);
        p.setEducationForm(emptyEducationForm);
      },
      p.editingEducationId === null ? "Education created" : "Education updated",
    );

  const saveSkill = () =>
    withRefresh(
      async () => {
        const payload = {
          title: p.skillForm.title,
          description: p.skillForm.description,
          iconName:
            p.skillForm.iconName.trim() === "" ? null : p.skillForm.iconName,
          order: Number(p.skillForm.order),
        };

        const route =
          p.editingSkillId === null
            ? "/api/about/skills"
            : `/api/about/skills/${p.editingSkillId}`;
        await apiRequest<Skill>(route, {
          method: p.editingSkillId === null ? "POST" : "PUT",
          body: JSON.stringify(payload),
        });

        p.setEditingSkillId(null);
        p.setSkillForm(emptySkillForm);
      },
      p.editingSkillId === null ? "Skill created" : "Skill updated",
    );

  const deleteExperience = (id: number) =>
    withRefresh(async () => {
      await apiRequest<void>(`/api/about/experiences/${id}`, {
        method: "DELETE",
      });
    }, "Experience deleted");

  const deleteEducation = (id: number) =>
    withRefresh(async () => {
      await apiRequest<void>(`/api/about/education/${id}`, {
        method: "DELETE",
      });
    }, "Education deleted");

  const deleteSkill = (id: number) =>
    withRefresh(async () => {
      await apiRequest<void>(`/api/about/skills/${id}`, { method: "DELETE" });
    }, "Skill deleted");

  return {
    saveIntro,
    saveProfile,
    saveExperience,
    saveEducation,
    saveSkill,
    deleteExperience,
    deleteEducation,
    deleteSkill,
  };
}
