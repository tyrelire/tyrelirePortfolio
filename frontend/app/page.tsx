import React from "react";
import { Avatar } from "radix-ui";
import { Icon } from "@iconify/react";

const about = {
  title: "About Me",
  description: "Fullstack Developer & Designer.",
  path: "/",
  intro: {
    title: "Introduction",
    display: true,
    description:
      "I am a passionate developer with experience in web and mobile technologies.",
  },
  work: {
    title: "Work Experience",
    display: true,
    experiences: [
      {
        company: "Tech Corp",
        role: "Frontend Developer",
        timeframe: "2022 - Present",
        achievements: ["Built a design system", "Led migration to React"],
        images: [],
      },
      {
        company: "Web Solutions",
        role: "Fullstack Developer",
        timeframe: "2020 - 2022",
        achievements: [
          "Developed e-commerce platform",
          "Improved performance by 30%",
        ],
        images: [],
      },
    ],
  },
  studies: {
    title: "Education",
    display: true,
    institutions: [
      {
        name: "University of Code",
        description: "BSc Computer Science, 2017-2020",
      },
    ],
  },
  technical: {
    title: "Skills",
    display: true,
    skills: [
      { title: "React", description: "Component-based UI library." },
      { title: "TypeScript", description: "Typed superset of JavaScript." },
      { title: "Node.js", description: "Backend JavaScript runtime." },
      { title: "CSS", description: "Styling for the web." },
    ],
  },
  tableOfContent: { display: false },
};

const person = {
  name: "Benjamin",
  avatar: "/jester-pp.webp",
  role: "Junior Software Engineer",
  location: "Europe/Paris",
  languages: ["French", "English"],
};

const social = [
  { name: "GitHub", icon: "mdi:github", link: "https://github.com/tyrelire" },
  {
    name: "LinkedIn",
    icon: "mdi:linkedin",
    link: "https://www.linkedin.com/in/benjamin-migliani-481295263/",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen pt-16 font-sans transition-colors">
      <aside className="flex flex-col items-center w-full px-4 py-8 gap-4 md:max-w-sm md:px-8 md:py-12 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:justify-center md:gap-8">
        <div className="flex flex-col items-center gap-3 md:gap-5 w-full">
          {/* <img
            src=
            alt="Avatar"
            className="rounded-full w-28 h-28 md:w-32 md:h-32 border-4 border-zinc-200 dark:border-zinc-800 shadow-lg"
          /> */}
          <Avatar.Root className="inline-flex size-[150px] select-none items-center justify-center overflow-hidden rounded-lg bg-blackA1 align-middle">
            <Avatar.Image
              className="size-full rounded-[inherit] object-cover"
              src={person.avatar}
              alt="Tyrelire"
            />
            <Avatar.Fallback
              className="leading-1 flex size-full items-center justify-center bg-white text-[15px] font-medium text-violet11"
              delayMs={600}
            >
              CT
            </Avatar.Fallback>
          </Avatar.Root>
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold">{person.name}</h1>
            <p className="text-base mt-1">{person.role}</p>
            <p className="text-sm mt-1">{person.location}</p>
          </div>
        </div>
        <div className="flex flex-row gap-4 mt-2 md:mt-3 items-center justify-center w-full">
          {social.map((item) => (
            <a
              key={item.name}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 flex items-center"
            >
              <Icon
                icon={item.icon}
                width={42}
                height={42}
                aria-label={item.name}
              />
            </a>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-2 md:mt-4 w-full">
          {person.languages.map((lang) => (
            <span
              key={lang}
              className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50 text-xs"
            >
              {lang}
            </span>
          ))}
        </div>
      </aside>
      <main className="flex-1 px-2 py-8 md:px-4 md:py-12 mx-auto w-full md:ml-0 md:max-w-none">
        {about.intro.display && (
          <section className="w-full mb-10 md:mb-12">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
              {about.intro.title}
            </h2>
            <p className="mb-3 md:mb-4 text-base md:text-lg">
              {about.intro.description}
            </p>
          </section>
        )}
        {about.work.display && (
          <section className="w-full mb-10 md:mb-12">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
              {about.work.title}
            </h2>
            <div className="space-y-5 md:space-y-6">
              {about.work.experiences.map((exp, i) => (
                <div key={i}>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-1">
                    <h3 className="text-lg font-bold">{exp.company}</h3>
                    <span className="text-sm">{exp.timeframe}</span>
                  </div>
                  <div className="mb-2">{exp.role}</div>
                  <ul className="list-disc pl-5">
                    {exp.achievements.map((ach, j) => (
                      <li key={j}>{ach}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
        {about.studies.display && (
          <section className="w-full mb-10 md:mb-12">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
              {about.studies.title}
            </h2>
            <div className="space-y-5 md:space-y-6">
              {about.studies.institutions.map((inst, i) => (
                <div key={i}>
                  <h3 className="text-lg font-bold">{inst.name}</h3>
                  <div>{inst.description}</div>
                </div>
              ))}
            </div>
          </section>
        )}
        {about.technical.display && (
          <section className="w-full mb-10 md:mb-12">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
              {about.technical.title}
            </h2>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {about.technical.skills.map((skill, i) => (
                <div
                  key={i}
                  className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs md:text-sm"
                >
                  <span className="font-semibold">{skill.title}</span>:{" "}
                  {skill.description}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
