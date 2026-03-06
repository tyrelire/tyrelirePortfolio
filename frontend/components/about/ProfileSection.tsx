import { Avatar } from "radix-ui";
import { Icon } from "@iconify/react";

export default function ProfileSection({ person }: { person: any }) {
  return (
    <aside className="flex flex-col items-center gap-6 px-6 py-12 min-w-[260px] max-w-[320px] h-fit md:sticky md:top-20 md:self-start mx-auto">
      <Avatar.Root className="border border-white/[.145] border-2 inline-flex size-[250px] select-none items-center justify-center overflow-hidden rounded-full bg-blackA1 align-middle">
        <Avatar.Image
          className="size-full rounded-[inherit] object-cover"
          src={person.avatar}
          alt="Avatar"
        />
        <Avatar.Fallback
          className="leading-1 flex size-full items-center justify-center bg-white text-[15px] font-medium text-violet11"
          delayMs={600}
        >
          CT
        </Avatar.Fallback>
      </Avatar.Root>
      <div className="text-center">
        <p className="text mt-1 flex items-center justify-center gap-2">
          <Icon
            icon="ion:earth-outline"
            width={24}
            height={24}
            className="text-[#e63946]"
            aria-label="World map"
          />
          {person.location}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center w-full">
        {person.languages.map((lang: string) => (
          <span
            key={lang}
            className="px-4 py-1.5 rounded-lg border text-sm font-medium"
          >
            {lang}
          </span>
        ))}
      </div>
    </aside>
  );
}
