"use client";

import { type ChangeEvent, type DragEvent, useCallback } from "react";
import {
  AdminHero,
  AdminMain,
  AnchorPills,
  Notice,
} from "./_components/AdminLayoutBits";
import { AdminSecurityCard } from "./_components/AdminSecurityCard";
import { AdminTabs, type AdminTab } from "./_components/AdminTabs";
import { EducationEditor } from "./_components/EducationEditor";
import { ExperienceEditor } from "./_components/ExperienceEditor";
import { IntroEditor } from "./_components/IntroEditor";
import { MessagesInbox } from "./_components/MessagesInbox";
import { ProfileAvatarEditor } from "./_components/ProfileAvatarEditor";
import { SkillsEditor } from "./_components/SkillsEditor";
import { SpinnerScreen } from "./_components/SpinnerScreen";
import { VisitorsAnalytics } from "./_components/VisitorsAnalytics";
import { useAboutAdmin } from "./_hooks/useAboutAdmin";
import { useAutoRetryLoad } from "./_hooks/useAutoRetryLoad";
import { useAvatarEditor } from "./_hooks/useAvatarEditor";
import { useAdminUiState } from "./_hooks/useAdminUiState";
import { useAdminSession } from "./_hooks/useAdminSession";
import { useMessagesData } from "./_hooks/useMessagesData";
import { useVisitorsAnalytics } from "./_hooks/useVisitorsAnalytics";
import { BACKEND_RETRY_MS } from "./_lib/constants";

export default function AdminPage() {
  const admin = useAboutAdmin();
  const avatar = useAvatarEditor();
  const messages = useMessagesData();
  const visitors = useVisitorsAnalytics();
  const session = useAdminSession(true);
  const { activeTab, setActiveTab } = useAdminUiState();

  const guardedLoadAbout = useCallback(
    (options?: { keepLoadingOnFail?: boolean }) => {
      if (!session.authenticated) {
        return Promise.resolve(true);
      }

      return admin.loadAll(options);
    },
    [admin, session.authenticated],
  );

  const guardedLoadMessages = useCallback(
    (options?: { keepLoadingOnFail?: boolean }) => {
      if (!session.authenticated) {
        return Promise.resolve(true);
      }

      return messages.loadMessages(options);
    },
    [messages, session.authenticated],
  );

  const guardedLoadVisitors = useCallback(
    (options?: { keepLoadingOnFail?: boolean }) => {
      if (!session.authenticated) {
        return Promise.resolve(true);
      }

      return visitors.loadVisitors(options);
    },
    [session.authenticated, visitors],
  );

  useAutoRetryLoad(guardedLoadAbout, BACKEND_RETRY_MS, session.authenticated);
  useAutoRetryLoad(
    guardedLoadMessages,
    BACKEND_RETRY_MS,
    session.authenticated,
  );
  useAutoRetryLoad(
    guardedLoadVisitors,
    BACKEND_RETRY_MS,
    session.authenticated,
  );

  const onDropImage = useCallback(
    async (event: DragEvent<HTMLDivElement>) => {
      admin.setError(null);
      const result = await avatar.handleDrop(event);
      if (result && result !== "No file dropped") {
        admin.setError(result);
      }
      return result;
    },
    [admin, avatar],
  );

  const onFileImage = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      admin.setError(null);
      const result = await avatar.handleFileInput(event);
      if (result && result !== "No file selected") {
        admin.setError(result);
      }
      return result;
    },
    [admin, avatar],
  );

  const onUploadCropped = useCallback(async () => {
    const imageData = avatar.buildImageData();
    if (!imageData) {
      admin.setError("Unable to render cropped avatar");
      return;
    }

    await admin.uploadAvatar(imageData);
    avatar.setEditorImage(null);
  }, [admin, avatar]);

  if (session.checking || !session.authenticated) {
    return <SpinnerScreen />;
  }

  return (
    <AdminMain>
      <AdminHero
        title="Admin Control Center"
        description="Manage About content, contact inbox, and anonymous visitor analytics from one page."
      />

      <AdminSecurityCard
        pseudo={session.pseudo}
        onLogout={session.logout}
        onChangePassword={session.changePassword}
      />

      <AdminTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "about" && (
        <>
          <AnchorPills
            links={[
              { href: "#intro", label: "Intro" },
              { href: "#profile", label: "Profile" },
              { href: "#experience", label: "Experience" },
              { href: "#education", label: "Education" },
              { href: "#skills", label: "Skills" },
            ]}
          />

          <Notice error={admin.error} message={admin.message} />

          <IntroEditor
            introForm={admin.introForm}
            setIntroForm={admin.setIntroForm}
            onSubmit={admin.saveIntro}
          />

          <ProfileAvatarEditor
            profileForm={admin.profileForm}
            setProfileForm={admin.setProfileForm}
            onSaveProfile={admin.saveProfile}
            avatarHistory={admin.avatarHistory}
            onUseHistoryAvatar={admin.useAvatarFromHistory}
            onDeleteHistoryAvatar={admin.deleteAvatar}
            onDropImage={onDropImage}
            onFileImage={onFileImage}
            avatarEditor={avatar}
            onStartDragging={avatar.startDragging}
            onZoomChange={avatar.setZoom}
            onCancelEditor={() => avatar.setEditorImage(null)}
            onUploadCropped={onUploadCropped}
            isUploadingAvatar={admin.isUploadingAvatar}
          />

          <ExperienceEditor
            form={admin.experienceForm}
            setForm={admin.setExperienceForm}
            isEditing={admin.editingExperienceId !== null}
            onSubmit={admin.saveExperience}
            onCancelEdit={admin.resetExperienceEdit}
            items={admin.experiences}
            onEdit={admin.editExperience}
            onDelete={(id) => {
              void admin.deleteExperience(id);
            }}
          />

          <EducationEditor
            form={admin.educationForm}
            setForm={admin.setEducationForm}
            isEditing={admin.editingEducationId !== null}
            onSubmit={admin.saveEducation}
            onCancelEdit={admin.resetEducationEdit}
            items={admin.education}
            onEdit={admin.editEducation}
            onDelete={(id) => {
              void admin.deleteEducation(id);
            }}
          />

          <SkillsEditor
            form={admin.skillForm}
            setForm={admin.setSkillForm}
            isEditing={admin.editingSkillId !== null}
            onSubmit={admin.saveSkill}
            onCancelEdit={admin.resetSkillEdit}
            items={admin.skills}
            onEdit={admin.editSkill}
            onDelete={(id) => {
              void admin.deleteSkill(id);
            }}
          />
        </>
      )}

      {activeTab === "messages" && (
        <>
          <Notice error={messages.error} message={messages.message} />
          <MessagesInbox
            messages={messages.messages}
            selectedId={messages.selectedId}
            onSelect={messages.setSelectedId}
            selected={messages.selectedMessage}
            onRead={messages.markAsRead}
            onDelete={messages.removeMessage}
          />
        </>
      )}

      {activeTab === "visitors" && (
        <>
          <Notice error={visitors.error} message={null} />
          <VisitorsAnalytics
            summary={visitors.summary}
            visitors={visitors.visitors}
          />
        </>
      )}
    </AdminMain>
  );
}
