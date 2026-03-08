import type { FormEvent } from "react";
import { inputClass } from "../_lib/constants";
import type { AboutIntro } from "../_lib/types";
import { SectionCard } from "./AdminLayoutBits";

export function IntroEditor(props: {
  introForm: AboutIntro;
  setIntroForm: (updater: (prev: AboutIntro) => AboutIntro) => void;
  onSubmit: () => Promise<void>;
}) {
  return (
    <SectionCard id="intro" title="Introduction">
      <form
        className="grid gap-3"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          void props.onSubmit();
        }}
      >
        <input
          className={inputClass}
          placeholder="Title"
          value={props.introForm.title}
          onChange={(event) => {
            props.setIntroForm((prev) => ({
              ...prev,
              title: event.target.value,
            }));
          }}
          required
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={props.introForm.display}
            onChange={(event) => {
              props.setIntroForm((prev) => ({
                ...prev,
                display: event.target.checked,
              }));
            }}
          />
          Display section
        </label>
        <textarea
          className={`${inputClass} min-h-28`}
          placeholder="Description"
          value={props.introForm.description}
          onChange={(event) => {
            props.setIntroForm((prev) => ({
              ...prev,
              description: event.target.value,
            }));
          }}
          required
        />
        <div>
          <button
            className="rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm"
            type="submit"
          >
            Save introduction
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
