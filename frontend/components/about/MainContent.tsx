import React from "react";
import { Icon } from "@iconify/react";
import ContactEmailTag from "./ContactEmailTag";

export default function MainContent({
  about,
  refs,
  person,
  social,
}: {
  about: any;
  refs: any;
  person?: any;
  social?: any[];
}) {
  return (
    <main className="flex-1 px-2 md:px-20 md:py-16 mx-auto w-full md:ml-0 md:max-w-3xl space-y-10">
      {about.intro.display && (
        <section
          ref={refs.introRef}
          className="w-full p-0 mb-10 md:mb-12 scroll-mt-24"
          id="introduction"
        >
          <h2
            className="text-5xl md:text-6xl font-extrabold mb-3 md:mb-2 mt-2 md:mt-0 text-center md:text-left"
            style={{ color: "var(--accent-red)" }}
          >
            {person?.name || ""}
          </h2>
          <h3
            className="text-lg md:text-2xl font-medium mb-6 md:mb-4 text-center md:text-left"
            style={{ color: "var(--color-foreground)" }}
          >
            {person?.role || ""}
          </h3>
          {social && (
            <div className="flex flex-row gap-1.5 md:gap-4 items-center mb-6 md:mb-8 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 justify-center md:justify-start">
              {social.map((item, idx) => (
                <a
                  key={item.name}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 flex items-center px-2.5 py-1 md:px-3 md:py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 backdrop-blur text-xs md:text-sm font-medium gap-1.5 md:gap-2 transition-colors"
                  style={{ textDecoration: "none" }}
                >
                  {item.icon ? (
                    typeof item.icon === "string" ? (
                      <span className="mr-1">{item.icon}</span>
                    ) : (
                      <>
                        <span className="block md:hidden">
                          <Icon
                            icon={item.icon.props.icon}
                            width={24}
                            height={24}
                          />
                        </span>
                        <span className="hidden md:block">
                          <Icon
                            icon={item.icon.props.icon}
                            width={32}
                            height={32}
                          />
                        </span>
                      </>
                    )
                  ) : null}
                  <span>{item.name}</span>
                </a>
              ))}
              <ContactEmailTag />
            </div>
          )}

          <p className="mb-3 md:mb-4 text-base md:text-lg">
            {about.intro.description}
          </p>
        </section>
      )}
      {about.work.display && (
        <section
          ref={refs.workRef}
          className="w-full p-0 mb-10 md:mb-12 scroll-mt-24"
          id="work"
        >
          <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-3">
            <span
              className="block w-2 h-6 rounded mr-2"
              style={{ background: "var(--accent-red)" }}
            ></span>
            <span style={{ color: "var(--accent-red)" }}>
              {about.work.title}
            </span>
          </h2>
          <div className="space-y-8 md:space-y-10">
            {about.work.experiences.map((exp: any, i: number) => (
              <div key={i}>
                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-2">
                  <h3
                    className="text-lg font-bold"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    {exp.company}
                  </h3>
                  <span
                    className="text-sm font-jetbrains-mono"
                    style={{ color: "var(--accent-red)" }}
                  >
                    {exp.timeframe}
                  </span>
                </div>
                <div
                  className="mb-3"
                  style={{ color: "var(--color-foreground)", opacity: 0.8 }}
                >
                  {exp.role}
                </div>
                <ul
                  className="list-disc pl-6 space-y-1"
                  style={{ color: "var(--color-foreground)" }}
                >
                  {exp.achievements.map((ach: string, j: number) => (
                    <li key={j}>{ach}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
      {about.studies.display && (
        <section
          ref={refs.studiesRef}
          className="w-full p-0 mb-10 md:mb-12 scroll-mt-24"
          id="studies"
        >
          <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-3">
            <span
              className="block w-2 h-6 rounded mr-2"
              style={{ background: "var(--accent-red)" }}
            ></span>
            <span style={{ color: "var(--accent-red)" }}>
              {about.studies.title}
            </span>
          </h2>
          <div className="space-y-8 md:space-y-10">
            {about.studies.institutions.map((inst: any, i: number) => (
              <div key={i}>
                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-2">
                  <h3
                    className="text-lg font-bold"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    {inst.name}
                  </h3>
                  {inst.date && (
                    <span
                      className="text-sm font-jetbrains-mono"
                      style={{ color: "var(--accent-red)" }}
                    >
                      {inst.date}
                    </span>
                  )}
                </div>
                <div style={{ color: "var(--color-foreground)", opacity: 0.8 }}>
                  {inst.description}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {about.technical.display && (
        <section
          ref={refs.skillsRef}
          className="w-full p-0 mb-10 md:mb-12 scroll-mt-24"
          id="skills"
        >
          <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-3">
            <span
              className="block w-2 h-6 rounded mr-2"
              style={{ background: "var(--accent-red)" }}
            ></span>
            <span style={{ color: "var(--accent-red)" }}>
              {about.technical.title}
            </span>
          </h2>
          <div className="flex flex-wrap gap-3 md:gap-4">
            {about.technical.skills.map((skill: any, i: number) => (
              <div
                key={i}
                className="px-4 py-2 rounded-full text-xs md:text-sm font-medium border mb-2"
                style={{
                  background: "var(--panel-background)",
                  borderColor: "var(--accent-blue-light)",
                }}
              >
                <span
                  className="font-semibold"
                  style={{ color: "var(--accent-red)" }}
                >
                  {skill.title}
                </span>
                <span className="mx-1" style={{ color: "var(--accent-blue)" }}>
                  :
                </span>
                <span style={{ color: "var(--color-foreground)" }}>
                  {skill.description}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
