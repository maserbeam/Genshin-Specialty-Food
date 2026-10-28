import { createFileRoute } from "@tanstack/react-router";
import { SpecialtyBoard } from "@/components/specialty-board";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <SpecialtyBoard />;
}
