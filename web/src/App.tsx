import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DriverApp } from "./pages/DriverApp";
import { LandingPage } from "./pages/LandingPage";
import { RiderApp } from "./pages/RiderApp";
import "./styles/botcab.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/rider" element={<RiderApp />} />
        <Route path="/driver" element={<DriverApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
