import { writeFile } from "node:fs/promises";
import path from "node:path";
import prisma from "../prisma/client";

const intro = {
  title: "Introduction",
  display: true,
  description:
    "Hi, I'm Benjamin, a 21-year-old computer science graduate from Epitech (Class of 2027), passionate about software development and technology. I enjoy exploring new technologies, learning modern languages and frameworks, and constantly improving my skills through personal projects. Feel free to browse my work and get a glimpse of what I have been building!",
};

const profile = {
  avatar: "/jester-pp.webp",
  location: "Europe/Paris",
  languages: ["French", "English"],
};

const avatarHistory = [
  {
    id: "default-avatar",
    url: "/jester-pp.webp",
    createdAt: new Date().toISOString(),
  },
];

const experiences = [
  {
    company: "FLUXEL",
    timeframe: "Jul 2023 - Dec 2023",
    role: "Junior Web Developer (Intern)",
    achievements: [
      "Participated in the digital transformation of access management procedures at a petrochemical terminal.",
      "Developed a web-based system to dematerialize circulation titles and manage access card requests.",
      "Worked with Symfony (PHP) in a real-world environment, improving backend logic and admin workflows.",
    ],
    order: 1,
  },
  {
    company: "CCEI",
    timeframe: "Mar 31, 2025 - Aug 14, 2025",
    role: "Embedded Systems Intern",
    achievements: [
      "Worked on the development of connected systems for smart pool automation and monitoring.",
      "Programmed microcontrollers using MicroPython, Python, C and C++ for real-time device communication.",
      "Learned and applied concepts in electronics, serial protocols, sensor integration, and embedded logic.",
    ],
    order: 2,
  },
];

const education = [
  {
    institution: "Epitech - The School of Digital Innovation",
    date: "2022 - 2027",
    description:
      "Master's degree in Computer Science, graduated in 2027. Strong foundations in C and C++, fullstack development, and project-based learning.",
    order: 1,
  },
  {
    institution: "Lycee CPEGM",
    date: "2019 - 2022",
    description:
      "French General Baccalaureat with a focus on Economic and Social Sciences (SES) and Digital Sciences (NSI).",
    order: 2,
  },
];

const skills = [
  {
    title: "React",
    description: "Component-based UI library.",
    iconName: null,
    order: 1,
  },
  {
    title: "TypeScript",
    description: "Typed superset of JavaScript.",
    iconName: null,
    order: 2,
  },
  {
    title: "Node.js",
    description: "Backend JavaScript runtime.",
    iconName: null,
    order: 3,
  },
  {
    title: "CSS",
    description: "Styling for the web.",
    iconName: null,
    order: 4,
  },
];

const seed = async () => {
  await prisma.pageView.deleteMany();
  await prisma.visitorEvent.deleteMany();
  await prisma.visitor.deleteMany();

  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.skill.deleteMany();

  await prisma.experience.createMany({
    data: experiences.map((item) => ({
      company: item.company,
      role: item.role,
      timeframe: item.timeframe,
      achievements: JSON.stringify(item.achievements),
      order: item.order,
    })),
  });

  await prisma.education.createMany({ data: education });
  await prisma.skill.createMany({ data: skills });

  const introPath = path.join(process.cwd(), "data", "about-intro.json");
  const profilePath = path.join(process.cwd(), "data", "about-profile.json");
  const profileAvatarsPath = path.join(
    process.cwd(),
    "data",
    "about-profile-avatars.json",
  );
  await writeFile(introPath, `${JSON.stringify(intro, null, 2)}\n`, "utf-8");
  await writeFile(
    profilePath,
    `${JSON.stringify(profile, null, 2)}\n`,
    "utf-8",
  );
  await writeFile(
    profileAvatarsPath,
    `${JSON.stringify(avatarHistory, null, 2)}\n`,
    "utf-8",
  );

  console.log("About fixture seeded successfully");
};

void seed()
  .catch((error) => {
    console.error("Failed to seed about fixture", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
