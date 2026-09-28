import { Outlet, useNavigate } from "react-router-dom";
import { useSessionUser } from "@/features/auth/useSessionUser";
import { BottomNav } from "./BottomNav";
import { SiteHeader } from "./SiteHeader";

/** Website shell: header + page + mobile bottom nav. */
export function SiteLayout() {
  const { current, loading, logout } = useSessionUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader
        user={current}
        loading={loading}
        onLogout={() => {
          if (current) logout(current.role);
          navigate("/");
        }}
      />
      <main className="flex-1 flex flex-col pb-20 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
