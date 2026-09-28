import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ConsoleLayout } from "./components/layout/ConsoleLayout";
import { SiteLayout } from "./components/layout/SiteLayout";
import { AuthPage } from "./features/auth/AuthPage";
import { DriverHomePage } from "./features/driver/DriverHomePage";
import { ProfilePage } from "./features/profile/ProfilePage";
import { SettingsPage } from "./features/profile/SettingsPage";
import { RiderHomePage } from "./features/rider/RiderHomePage";
import { TripsPage } from "./features/trips/TripsPage";
import { I18nProvider } from "@/i18n";
import { LandingPage } from "./pages/LandingPage";

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          {/* Website pages: top header + content */}
          <Route element={<SiteLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Booking consoles: left sidebar + map, no top header */}
          <Route element={<ConsoleLayout />}>
            <Route path="/rider" element={<RiderHomePage />} />
            <Route path="/driver" element={<DriverHomePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
