import { AppHeader } from "@/components/ui/app-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-gray-50">
      <AppHeader />
      {children}
    </div>
  );
}
