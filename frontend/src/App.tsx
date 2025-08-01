// src/App.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "@/components/layout/root-layout";
import DashboardPage from "@/pages/dashboard-page";
import BrowseOrdersPage from "@/pages/browse-orders-page";
import MyAmuletPage from "@/pages/my-amulet-page";

// Defines all the routes for the application
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />, // The main layout wraps all pages
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "orders", element: <BrowseOrdersPage /> },
      { path: "my-amulet", element: <MyAmuletPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
