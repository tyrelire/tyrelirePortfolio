"use client";
import { useRef } from "react";
import ProfileSection from "../../components/about/ProfileSection";
import ScrollMenu from "../../components/about/ScrollMenu";
import MainContent from "../../components/about/MainContent";
import { Icon } from "@iconify/react";

const about = {
  title: "About Me",
  description: "Fullstack Developer & Designer.",
  path: "/",
  intro: {
    title: "Introduction",
    display: true,
    description:
      "Hi, I'm Benjamin, a 21-year-old computer science graduate from Epitech \
      (Class of 2027), passionate about software development and technology. I enjoy \
      exploring new technologies, learning modern languages and frameworks, \
      and constantly improving my skills through personal projects. Feel free \
      to browse my work and get a glimpse of what I’ve been building!",
  },
  work: {
    title: "Work Experience",
    display: true,
    experiences: [
      {
        company: "FLUXEL",
        timeframe: "Jul 2023 – Dec 2023",
        role: "Junior Web Developer (Intern)",
        achievements: [
          <>
            Participated in the digital transformation of access management
            procedures at a petrochemical terminal.
          </>,
          <>
            Developed a web-based system to dematerialize circulation titles and
            manage access card requests.
          </>,
          <>
            Worked with Symfony (PHP) in a real-world environment, improving
            backend logic and admin workflows.
          </>,
        ],
        images: [],
      },
      {
        company: "CCEI",
        timeframe: "Mar 31, 2025 – Aug 14, 2025",
        role: "Embedded Systems Intern",
        achievements: [
          <>
            Worked on the development of connected systems for smart pool
            automation and monitoring.
          </>,
          <>
            Programmed microcontrollers using MicroPython, Python, C and C++ for
            real-time device communication.
          </>,
          <>
            Learned and applied concepts in electronics, serial protocols,
            sensor integration, and embedded logic.
          </>,
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
        name: "Epitech – The School of Digital Innovation",
        date: "2022 – 2027",
        description: (
          <>
            Master's degree in Computer Science, graduated in 2027. Strong
            foundations in C and C++, fullstack development, and project-based
            learning.
          </>
        ),
      },
      {
        name: "Lycée CPEGM",
        date: "2019 – 2022",
        description: (
          <>
            French General Baccalauréat with a focus on Economic and Social
            Sciences (SES) and Digital Sciences (NSI).
          </>
        ),
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
  name: "Benjamin M",
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
  const introRef = useRef<HTMLDivElement>(null);
  const workRef = useRef<HTMLDivElement>(null);
  const studiesRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  const refs = { introRef, workRef, studiesRef, skillsRef };
  const structure = [
    { title: about.intro.title, display: about.intro.display },
    { title: about.work.title, display: about.work.display },
    { title: about.studies.title, display: about.studies.display },
    { title: about.technical.title, display: about.technical.display },
  ];
  const scrollTo = (idx: number) => {
    if (idx === 0 && introRef.current)
      introRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    if (idx === 1 && workRef.current)
      workRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    if (idx === 2 && studiesRef.current)
      studiesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    if (idx === 3 && skillsRef.current)
      skillsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen pt-16 transition-colors bg-background">
      {/* ScrollMenu: hidden on mobile, visible on md+ */}
      <div className="hidden md:block">
        <ScrollMenu structure={structure} scrollTo={scrollTo} />
      </div>
      <div className="w-full flex flex-col md:flex-row md:gap-8 items-center md:items-start">
        {/* ProfileSection: full width on mobile, sidebar on md+ */}
        <div className="w-full md:w-[320px] md:flex-shrink-0 flex justify-center md:block mb-8 md:mb-0">
          <ProfileSection person={person} />
        </div>
        {/* MainContent: full width on mobile, main area on md+ */}
        <div className="w-full flex flex-col items-center md:items-start">
          <MainContent
            about={about}
            refs={refs}
            person={person}
            social={social.map((s) => ({
              ...s,
              icon: (
                <Icon
                  icon={s.icon}
                  width={32}
                  height={32}
                  aria-label={s.name}
                />
              ),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
