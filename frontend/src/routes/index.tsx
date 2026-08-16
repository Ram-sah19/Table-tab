import { createFileRoute } from "@tanstack/react-router";
import { Welcome } from "@/components/Welcome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saffron & Ember — Order from your table" },
      {
        name: "description",
        content:
          "Scan, browse the menu and order from your table at Saffron & Ember. Live updates from order received to served.",
      },
      { property: "og:title", content: "Saffron & Ember — Order from your table" },
      {
        property: "og:description",
        content: "Scan, browse and order from your table with live kitchen updates.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <Welcome />;
}
