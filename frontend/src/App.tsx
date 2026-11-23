import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { MainLayout } from "@/shared/layout/MainLayout";
import { AppRouter } from "@/routes/AppRouter";

export function App() {
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <MainLayout>
      <AppRouter />
    </MainLayout>
  );
}

export default App;