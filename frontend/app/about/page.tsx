"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import ProfileSection from "../../components/about/ProfileSection";
import ScrollMenu from "../../components/about/ScrollMenu";
import MainContent from "../../components/about/MainContent";

type Experience = {
  id: number;
  company: string;
  role: string;
  timeframe: string;
  achievements: string[];
  order: number;
};

type Education = {
  id: number;
  institution: string;
  date: string;
  description: string;
  order: number;
};

type Skill = {
  id: number;
  title: string;
  description: string;
  iconName: string | null;
  order: number;
};

type AboutIntro = {
  title: string;
  display: boolean;
  description: string;
};

type AboutProfile = {
  avatar: string;
  location: string;
  languages: string[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const BACKEND_RETRY_MS = 2000;

const person = {
  name: "Benjamin M",
  avatar: "/jester-pp.webp",
  role: "Junior Software Engineer",
  location: "Europe/Paris",
  languages: ["French", "English"],
};

const defaultProfile: AboutProfile = {
  avatar: person.avatar,
  location: person.location,
  languages: person.languages,
};

const social = [
  { name: "GitHub", icon: "mdi:github", link: "https://github.com/tyrelire" },
  {
    name: "LinkedIn",
    icon: "mdi:linkedin",
    link: "https://www.linkedin.com/in/benjamin-migliani-481295263/",
  },
];

const ABOUT_BASE = {
  title: "About Me",
  description: "Fullstack Developer & Designer.",
  path: "/",
  intro: {
    title: "Introduction",
    display: true,
    description:
      "Hi, I'm Benjamin, a 21-year-old computer science graduate from Epitech (Class of 2027), passionate about software development and technology. I enjoy exploring new technologies, learning modern languages and frameworks, and constantly improving my skills through personal projects. Feel free to browse my work and get a glimpse of what I have been building!",
  },
  work: {
    title: "Work Experience",
    display: true,
  },
  studies: {
    title: "Education",
    display: true,
  },
  technical: {
    title: "Skills",
    display: true,
  },
  tableOfContent: { display: false },
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export default function AboutPage() {
  const introRef = useRef<HTMLDivElement>(null);
  const workRef = useRef<HTMLDivElement>(null);
  const studiesRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [intro, setIntro] = useState<AboutIntro>(ABOUT_BASE.intro);
  const [profile, setProfile] = useState<AboutProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);

  const loadAboutData = async (): Promise<boolean> => {
    setLoading(true);

    try {
      const [
        experiencesData,
        educationData,
        skillsData,
        introData,
        profileData,
      ] = await Promise.all([
        fetchJson<Experience[]>("/api/about/experiences"),
        fetchJson<Education[]>("/api/about/education"),
        fetchJson<Skill[]>("/api/about/skills"),
        fetchJson<AboutIntro>("/api/about/intro"),
        fetchJson<AboutProfile>("/api/about/profile"),
      ]);

      setExperiences(experiencesData);
      setEducation(educationData);
      setSkills(skillsData);
      setIntro(introData);
      setProfile(profileData);
      setLoading(false);
      return true;
    } catch {
      // Keep spinner visible indefinitely when backend is unavailable.
      return false;
    }
  };

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const attemptLoad = async () => {
      if (cancelled) {
        return;
      }

      const isLoaded = await loadAboutData();
      if (!isLoaded && !cancelled) {
        retryTimer = setTimeout(() => {
          void attemptLoad();
        }, BACKEND_RETRY_MS);
      }
    };

    void attemptLoad();

    return () => {
      cancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, []);

  const refs = { introRef, workRef, studiesRef, skillsRef };
  const resolvedAvatarUrl = profile.avatar.startsWith("/uploads/")
    ? `${API_BASE_URL}${profile.avatar}`
    : profile.avatar;

  const about = useMemo(
    () => ({
      ...ABOUT_BASE,
      intro,
      work: {
        ...ABOUT_BASE.work,
        experiences: experiences.map((item) => ({
          company: item.company,
          timeframe: item.timeframe,
          role: item.role,
          achievements: item.achievements,
          images: [],
        })),
      },
      studies: {
        ...ABOUT_BASE.studies,
        institutions: education.map((item) => ({
          name: item.institution,
          date: item.date,
          description: item.description,
        })),
      },
      technical: {
        ...ABOUT_BASE.technical,
        skills: skills.map((item) => ({
          title: item.title,
          description: item.description,
        })),
      },
    }),
    [education, experiences, intro, skills],
  );

  const structure = [
    { title: about.intro.title, display: about.intro.display },
    { title: about.work.title, display: about.work.display },
    { title: about.studies.title, display: about.studies.display },
    { title: about.technical.title, display: about.technical.display },
  ];

  const scrollTo = (idx: number) => {
    if (idx === 0 && introRef.current) {
      introRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (idx === 1 && workRef.current) {
      workRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (idx === 2 && studiesRef.current) {
      studiesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (idx === 3 && skillsRef.current) {
      skillsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 px-4 sm:px-6 flex items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen pt-16 transition-colors bg-background">
      <div className="hidden md:block">
        <ScrollMenu structure={structure} scrollTo={scrollTo} />
      </div>

      <div className="w-full flex flex-col md:flex-row md:gap-8 items-center md:items-start">
        <div className="w-full md:w-[320px] md:flex-shrink-0 flex justify-center md:block mb-8 md:mb-0">
          <ProfileSection
            person={{
              ...person,
              avatar: resolvedAvatarUrl,
              location: profile.location,
              languages: profile.languages,
            }}
          />
        </div>

        <div className="w-full flex flex-col items-center md:items-start">
          <MainContent
            about={about}
            refs={refs}
            person={person}
            social={social.map((item) => ({
              ...item,
              icon: (
                <Icon
                  icon={item.icon}
                  width={32}
                  height={32}
                  aria-label={item.name}
                />
              ),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
