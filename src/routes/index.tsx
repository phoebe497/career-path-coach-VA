import { createFileRoute } from "@tanstack/react-router";
import { CareerFitApp } from "@/components/careerfit/CareerFitApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerFit AI — Learn Before You Apply" },
      {
        name: "description",
        content:
          "Match your CV against any job description, see your fit score, and get a personalized learning roadmap to land the role.",
      },
      { property: "og:title", content: "CareerFit AI — Learn Before You Apply" },
      {
        property: "og:description",
        content:
          "Match your CV against any job description, see your fit score, and get a personalized learning roadmap.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  return <CareerFitApp />;
}
