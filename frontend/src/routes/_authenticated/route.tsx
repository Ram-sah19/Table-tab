import { useEffect, useState } from "react";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { validateStaffSession } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void validateStaffSession().then((session) => {
      if (!session) {
        navigate({ to: "/auth", replace: true });
      } else {
        setReady(true);
      }
    });
  }, [navigate]);

  if (!ready) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </main>
    );
  }

  return <Outlet />;
}
