import { type FormEvent } from "react";
import { inputClass } from "../_lib/constants";
import type { Education, EducationForm } from "../_lib/types";
import { SectionCard } from "./AdminLayoutBits";

export function EducationEditor(props: {
  form: EducationForm;
  setForm: (updater: (prev: EducationForm) => EducationForm) => void;
  isEditing: boolean;
  onSubmit: () => Promise<void>;
  onCancelEdit: () => void;
  items: Education[];
  onEdit: (item: Education) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <SectionCard id="education" title="Education">
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
            placeholder="Institution"
            value={props.form.institution}
            onChange={(event) =>
              props.setForm((prev) => ({
                ...prev,
                institution: event.target.value,
              }))
            }
            required
          />
          <input
            className={inputClass}
            placeholder="Date"
            value={props.form.date}
            onChange={(event) =>
              props.setForm((prev) => ({ ...prev, date: event.target.value }))
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
                <h3 className="font-semibold">{item.institution}</h3>
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
              <p className="text-sm opacity-80">{item.date}</p>
            </article>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
