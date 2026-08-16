import { createFileRoute } from "@tanstack/react-router";
import { Welcome } from "@/components/Welcome";

export const Route = createFileRoute("/table/$table")({
  head: () => ({
    meta: [
      { title: "Your table — Saffron & Ember" },
      {
        name: "description",
        content: "Your table is ready. Enter your name and start ordering at Saffron & Ember.",
      },
      { property: "og:title", content: "Your table — Saffron & Ember" },
      { property: "og:description", content: "Enter your name and start ordering." },
    ],
  }),
  component: TablePage,
});

function TablePage() {
  const { table } = Route.useParams();
  return <Welcome presetTable={table} />;
}
