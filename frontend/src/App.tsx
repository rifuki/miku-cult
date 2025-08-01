// src/App.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "@/components/layout/root-layout";
import DashboardPage from "@/pages/dashboard-page";
import BrowseOrdersPage from "@/pages/browse-orders-page";
import MyAmuletPage from "@/pages/my-amulet-page";
import ManageOrdersPage from "@/pages/manage-orders-page"; // Import halaman admin yang baru
import OrderSettingsPage from "@/pages/order-settings-page";
import LeaderboardPage from "./pages/leaderboard-page";

// Defines all the routes for the application
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />, // The main layout wraps all pages
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "orders", element: <BrowseOrdersPage /> },
      { path: "orders/:shrineId/settings", element: <OrderSettingsPage /> },
      { path: "my-amulet", element: <MyAmuletPage /> },
      { path: "manage", element: <ManageOrdersPage /> }, // Tambahkan rute admin yang baru
      { path: "leaderboard", element: <LeaderboardPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
