import type { MouseEvent } from "react";

export function smoothScrollToHash(hash: string) {
  const id = hash.replace(/^#/, "");
  if (!id) return;

  const target = document.getElementById(id);
  if (!target) return;

  const navbarHeight =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--navbar-height"),
    ) || 80;

  const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

  window.scrollTo({ top, behavior: "smooth" });
}

export function handleNavClick(
  event: MouseEvent<HTMLAnchorElement>,
  hash: string,
  onAfterScroll?: () => void,
) {
  event.preventDefault();
  smoothScrollToHash(hash);
  onAfterScroll?.();
}
