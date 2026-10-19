import type { Metadata } from "next";
import { WorkGallery } from "@/components/work/WorkGallery";
import { projects } from "@/lib/work";

export const metadata: Metadata = {
  title: "Work — Endah Liyusliha",
};

export default function WorkPage() {
  return (
    <main>
      <h1 className="sr-only">Work</h1>
      <WorkGallery projects={projects} />
    </main>
  );
}
