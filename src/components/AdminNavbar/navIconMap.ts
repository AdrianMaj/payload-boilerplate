import { Image, type LucideProps, Users } from "lucide-react";
import { type CollectionSlug } from "payload";
import { type ExoticComponent } from "react";

export const navIconMap: Partial<Record<CollectionSlug, ExoticComponent<LucideProps>>> = {
  media: Image,
  users: Users,
};

export const getNavIcon = (slug: string) =>
  Object.hasOwn(navIconMap, slug) ? navIconMap[slug as CollectionSlug] : undefined;
