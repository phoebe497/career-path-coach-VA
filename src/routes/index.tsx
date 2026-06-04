import { createFileRoute } from "@tanstack/react-router";
import { CareerFitApp } from "@/components/careerfit/CareerFitApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerFit AI - Học trước khi ứng tuyển" },
      {
        name: "description",
        content:
          "So khớp CV với mô tả công việc, xem điểm phù hợp và nhận lộ trình học cá nhân hóa.",
      },
      { property: "og:title", content: "CareerFit AI - Học trước khi ứng tuyển" },
      {
        property: "og:description",
        content:
          "So khớp CV với mô tả công việc, xem điểm phù hợp và nhận lộ trình học cá nhân hóa.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  return <CareerFitApp />;
}

