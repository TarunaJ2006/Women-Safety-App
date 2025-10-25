import React, { Suspense, lazy } from "react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

// 🧩 Lazy-loaded pages (faster initial load)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Emergency = lazy(() => import("./pages/Emergency"));
const Settings = lazy(() => import("./pages/Settings"));

// ⚠️ Simple error page
function ErrorPage({ error }) {
  console.error(error);
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>⚠️ Oops!</h1>
      <p>Something went wrong while loading this page.</p>
      <a href="/">Go back to Dashboard</a>
    </div>
  );
}

// ✅ Router configuration (v7-ready)
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <Suspense fallback={<p style={{ textAlign: "center" }}>Loading...</p>}>
          <Dashboard />
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/emergency",
      element: (
        <Suspense fallback={<p style={{ textAlign: "center" }}>Loading...</p>}>
          <Emergency />
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: "/settings",
      element: (
        <Suspense fallback={<p style={{ textAlign: "center" }}>Loading...</p>}>
          <Settings />
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    },
  ],
  {
    // 🚀 Future-proof React Router v7 behavior
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

// ✅ Main App component
export default function App() {
  return <RouterProvider router={router} />;
}
