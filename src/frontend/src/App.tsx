import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AdminPage from "./pages/AdminPage";
import PortfolioPage from "./pages/PortfolioPage";

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.14 0 0)",
            border: "1px solid oklch(0.96 0 0 / 10%)",
            color: "oklch(0.96 0 0)",
          },
        }}
      />
    </>
  ),
});

// Portfolio route (index)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: PortfolioPage,
});

// Admin route
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([indexRoute, adminRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
