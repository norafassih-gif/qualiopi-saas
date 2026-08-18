import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HorizonHeroSection } from "@/components/ui/horizon-hero-section";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <HorizonHeroSection>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/signup"
          className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          Créer mon compte
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
        >
          Se connecter
        </Link>
      </div>
    </HorizonHeroSection>
  );
}
