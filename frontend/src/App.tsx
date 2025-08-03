import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootLayout from "@/components/layout/root-layout";

import DashboardPage from "@/pages/dashboard-page";
import BrowseOrdersPage from "@/pages/browse-orders-page";
import MyAmuletPage from "@/pages/my-amulet-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import ManageOrdersPage from "@/pages/manage-orders-page";
import OrderSettingsPage from "@/pages/order-settings-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />, // The main layout wraps all pages
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "orders", element: <BrowseOrdersPage /> },
      { path: "my-amulet", element: <MyAmuletPage /> },
      { path: "leaderboard", element: <LeaderboardPage /> },
      { path: "manage", element: <ManageOrdersPage /> },
      { path: "orders/:shrineId/settings", element: <OrderSettingsPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
