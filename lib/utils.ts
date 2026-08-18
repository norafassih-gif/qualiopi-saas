import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne des classes Tailwind en gérant proprement les conflits
 * (ex. "px-2" + "px-4" => "px-4"). Convention standard shadcn/ui —
 * utilisée par tous les composants d'interface du projet.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
