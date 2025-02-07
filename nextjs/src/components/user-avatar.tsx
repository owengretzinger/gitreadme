"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function UserAvatar({ 
  image, 
  name 
}: { 
  image: string | null | undefined;
  name: string | null | undefined;
}) {
  return (
    <Avatar className="h-6 w-6">
      <AvatarImage
        src={image ?? undefined}
        alt={name ?? "User"}
        onError={(e) => {
          console.error("Avatar image failed to load:", e);
        }}
        className="h-full w-full object-cover"
      />
      <AvatarFallback>
        {name?.[0]?.toUpperCase() ?? "U"}
      </AvatarFallback>
    </Avatar>
  );
} 