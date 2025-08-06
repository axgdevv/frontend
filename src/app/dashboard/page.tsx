import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="h-screen w-full flex items-center justify-center"></div>
    </ProtectedRoute>
  );
}
