import { type FormEvent } from "react";
import { inputClass } from "../_lib/constants";
import type { Skill, SkillForm } from "../_lib/types";
import { SectionCard } from "./AdminLayoutBits";

export function SkillsEditor(props: {
  form: SkillForm;
  setForm: (updater: (prev: SkillForm) => SkillForm) => void;
  isEditing: boolean;
  onSubmit: () => Promise<void>;
  onCancelEdit: () => void;
  items: Skill[];
  onEdit: (item: Skill) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <SectionCard id="skills" title="Skills">
      <div className="grid lg:grid-cols-2 gap-5">
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
            value={props.form.title}
            onChange={(event) =>
              props.setForm((prev) => ({ ...prev, title: event.target.value }))
            }
            required
          />
          <textarea
            className={`${inputClass} min-h-20`}
            placeholder="Description"
            value={props.form.description}
            onChange={(event) =>
              props.setForm((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
            required
          />
          <input
            className={inputClass}
            placeholder="Icon name (optional)"
            value={props.form.iconName}
            onChange={(event) =>
              props.setForm((prev) => ({
                ...prev,
                iconName: event.target.value,
              }))
            }
          />
          <input
            type="number"
            className={inputClass}
            placeholder="Order"
            value={props.form.order}
            onChange={(event) =>
              props.setForm((prev) => ({
                ...prev,
                order: Number(event.target.value),
              }))
            }
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm"
            >
              {props.isEditing ? "Update" : "Create"}
            </button>
            {props.isEditing && (
              <button
                type="button"
                className="rounded-md border px-4 py-2 text-sm"
                onClick={props.onCancelEdit}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <div className="space-y-3">
          {props.items.map((item) => (
            <article key={item.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{item.title}</h3>
                <div className="flex gap-2">
                  <button
                    className="text-sm px-3 py-1 rounded border"
                    onClick={() => props.onEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-sm px-3 py-1 rounded border"
                    onClick={() => props.onDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-sm opacity-80">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
