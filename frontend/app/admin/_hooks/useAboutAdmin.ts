import { useCallback, useMemo, useState } from "react";
import { apiRequest } from "../_lib/api";
import {
  emptyEducationForm,
  emptyExperienceForm,
  emptyIntroForm,
  emptyProfileForm,
  emptySkillForm,
} from "../_lib/constants";
import type {
  AboutIntro,
  AboutProfile,
  AvatarHistoryItem,
  Education,
  EducationForm,
  Experience,
  ExperienceForm,
  Skill,
  SkillForm,
} from "../_lib/types";
import { useAboutAdminActions } from "./useAboutAdminActions";
import { useAboutAvatarActions } from "./useAboutAvatarActions";

export function useAboutAdmin() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [avatarHistory, setAvatarHistory] = useState<AvatarHistoryItem[]>([]);

  const [introForm, setIntroForm] = useState<AboutIntro>(emptyIntroForm);
  const [profileForm, setProfileForm] =
    useState<AboutProfile>(emptyProfileForm);
  const [experienceForm, setExperienceForm] =
    useState<ExperienceForm>(emptyExperienceForm);
  const [educationForm, setEducationForm] =
    useState<EducationForm>(emptyEducationForm);
  const [skillForm, setSkillForm] = useState<SkillForm>(emptySkillForm);

  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(
    null,
  );
  const [editingEducationId, setEditingEducationId] = useState<number | null>(
    null,
  );
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const loadAll = useCallback(
    async (options?: { keepLoadingOnFail?: boolean; showLoader?: boolean }) => {
      const showLoader = options?.showLoader ?? true;

      if (showLoader) {
        setLoading(true);
      }
      setError(null);

      try {
        const [
          expData,
          eduData,
          skillsData,
          introData,
          profileData,
          avatarsData,
        ] = await Promise.all([
          apiRequest<Experience[]>("/api/about/experiences", { method: "GET" }),
          apiRequest<Education[]>("/api/about/education", { method: "GET" }),
          apiRequest<Skill[]>("/api/about/skills", { method: "GET" }),
          apiRequest<AboutIntro>("/api/about/intro", { method: "GET" }),
          apiRequest<AboutProfile>("/api/about/profile", { method: "GET" }),
          apiRequest<AvatarHistoryItem[]>("/api/about/profile/avatars", {
            method: "GET",
          }),
        ]);

        setExperiences(expData);
        setEducation(eduData);
        setSkills(skillsData);
        setIntroForm(introData);
        setProfileForm(profileData);
        setAvatarHistory(avatarsData);
        if (showLoader) {
          setLoading(false);
        }
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load admin data",
        );
        if (showLoader && !options?.keepLoadingOnFail) {
          setLoading(false);
        }
        return false;
      }
    },
    [],
  );

  const actions = useAboutAdminActions({
    introForm,
    profileForm,
    experienceForm,
    educationForm,
    skillForm,
    editingExperienceId,
    editingEducationId,
    editingSkillId,
    setError,
    setMessage,
    refresh: () => loadAll({ showLoader: false }),
    setExperienceForm,
    setEducationForm,
    setSkillForm,
    setEditingExperienceId,
    setEditingEducationId,
    setEditingSkillId,
  });

  const avatarActions = useAboutAvatarActions({
    setError,
    setMessage,
    setIsUploadingAvatar,
    refresh: () => loadAll({ showLoader: false }),
  });

  const helpers = useMemo(
    () => ({
      editExperience: (item: Experience) => {
        setEditingExperienceId(item.id);
        setExperienceForm({
          company: item.company,
          role: item.role,
          timeframe: item.timeframe,
          achievementsText: item.achievements.join("\n"),
          order: item.order,
        });
      },
      editEducation: (item: Education) => {
        setEditingEducationId(item.id);
        setEducationForm({
          institution: item.institution,
          date: item.date,
          description: item.description,
          order: item.order,
        });
      },
      editSkill: (item: Skill) => {
        setEditingSkillId(item.id);
        setSkillForm({
          title: item.title,
          description: item.description,
          iconName: item.iconName ?? "",
          order: item.order,
        });
      },
      resetExperienceEdit: () => {
        setEditingExperienceId(null);
        setExperienceForm(emptyExperienceForm);
      },
      resetEducationEdit: () => {
        setEditingEducationId(null);
        setEducationForm(emptyEducationForm);
      },
      resetSkillEdit: () => {
        setEditingSkillId(null);
        setSkillForm(emptySkillForm);
      },
    }),
    [],
  );

  return {
    loading,
    error,
    message,
    experiences,
    education,
    skills,
    avatarHistory,
    introForm,
    profileForm,
    experienceForm,
    educationForm,
    skillForm,
    editingExperienceId,
    editingEducationId,
    editingSkillId,
    isUploadingAvatar,
    setError,
    setIntroForm,
    setProfileForm,
    setExperienceForm,
    setEducationForm,
    setSkillForm,
    loadAll,
    ...actions,
    ...avatarActions,
    ...helpers,
  };
}
