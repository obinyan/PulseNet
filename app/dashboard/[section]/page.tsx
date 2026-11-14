import { notFound } from "next/navigation";

// Safety net. This folder once held placeholder pages. Every section now has its own page,
// so this route renders nothing. It is kept so that an old copy of this file gets overwritten
// when a new zip is extracted over an old project.
export const dynamicParams = false;
export function generateStaticParams() { return []; }
export default function Unused() { notFound(); }
