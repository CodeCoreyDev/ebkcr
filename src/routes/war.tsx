import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for `/war` and its drilldowns (e.g. `/war/history`). The actual
// landing content lives in `war.index.tsx`.
export const Route = createFileRoute("/war")({
  component: WarLayout,
});

function WarLayout() {
  return <Outlet />;
}
