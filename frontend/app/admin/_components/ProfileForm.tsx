import { type FormEvent } from "react";
import { inputClass } from "../_lib/constants";
import { resolveAvatarUrl } from "../_lib/helpers";
import type { AboutProfile } from "../_lib/types";

export function ProfileForm(props: {
  profileForm: AboutProfile;
  setProfileForm: (updater: (prev: AboutProfile) => AboutProfile) => void;
  onSubmit: () => Promise<void>;
}) {
  return (
    <form
      className="grid gap-3"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void props.onSubmit();
      }}
    >
      <div className="flex items-center gap-4">
        <img
          src={resolveAvatarUrl(props.profileForm.avatar)}
          alt="Current avatar"
          className="h-20 w-20 rounded-full border object-cover"
        />
        <div className="text-sm opacity-75">Current profile avatar</div>
      </div>
      <input
        className={inputClass}
        placeholder="Location"
        value={props.profileForm.location}
        onChange={(event) =>
          props.setProfileForm((prev) => ({
            ...prev,
            location: event.target.value,
          }))
        }
        required
      />
      <input
        className={inputClass}
        placeholder="Languages (comma separated)"
        value={props.profileForm.languages.join(", ")}
        onChange={(event) =>
          props.setProfileForm((prev) => ({
            ...prev,
            languages: event.target.value.split(","),
          }))
        }
        required
      />
      <div>
        <button
          className="rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm"
          type="submit"
        >
          Save profile
        </button>
      </div>
    </form>
  );
}
