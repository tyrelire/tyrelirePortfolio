import type { ChangeEvent, DragEvent, MouseEvent, RefObject } from "react";
import type { AboutProfile, AvatarHistoryItem } from "../_lib/types";
import { SectionCard } from "./AdminLayoutBits";
import { AvatarManager } from "./AvatarManager";
import { ProfileForm } from "./ProfileForm";

type AvatarEditorState = {
  editorImage: string | null;
  cropX: number;
  cropY: number;
  zoom: number;
  isDragging: boolean;
  imageRef: RefObject<HTMLImageElement | null>;
};

export function ProfileAvatarEditor(props: {
  profileForm: AboutProfile;
  setProfileForm: (updater: (prev: AboutProfile) => AboutProfile) => void;
  onSaveProfile: () => Promise<void>;
  avatarHistory: AvatarHistoryItem[];
  onUseHistoryAvatar: (id: string) => Promise<void>;
  onDeleteHistoryAvatar: (id: string) => Promise<void>;
  onDropImage: (event: DragEvent<HTMLDivElement>) => Promise<string | null>;
  onFileImage: (event: ChangeEvent<HTMLInputElement>) => Promise<string | null>;
  avatarEditor: AvatarEditorState;
  onStartDragging: (event: MouseEvent<HTMLDivElement>) => void;
  onZoomChange: (zoom: number) => void;
  onCancelEditor: () => void;
  onUploadCropped: () => Promise<void>;
  isUploadingAvatar: boolean;
}) {
  return (
    <SectionCard id="profile" title="Profile & Avatar">
      <div className="space-y-5">
        <ProfileForm
          profileForm={props.profileForm}
          setProfileForm={props.setProfileForm}
          onSubmit={props.onSaveProfile}
        />

        <AvatarManager
          avatarHistory={props.avatarHistory}
          onUseHistoryAvatar={props.onUseHistoryAvatar}
          onDeleteHistoryAvatar={props.onDeleteHistoryAvatar}
          onDropImage={props.onDropImage}
          onFileImage={props.onFileImage}
          avatarEditor={props.avatarEditor}
          onStartDragging={props.onStartDragging}
          onZoomChange={props.onZoomChange}
          onCancelEditor={props.onCancelEditor}
          onUploadCropped={props.onUploadCropped}
          isUploadingAvatar={props.isUploadingAvatar}
        />
      </div>
    </SectionCard>
  );
}
