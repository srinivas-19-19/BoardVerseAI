import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/SubmitButton";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function Signup({
  searchParams,
}: {
  searchParams: { message: string; next?: string };
}) {
  const nextUrl = searchParams?.next || "";

  const signUp = async (formData: FormData) => {
    "use server";

    const origin = (await headers()).get("origin");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const nextDest = formData.get("next") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback${nextDest ? `?next=${encodeURIComponent(nextDest)}` : ""}`,
      },
    });

    if (error) {
      const params = new URLSearchParams({ message: error.message });
      if (nextDest) params.set("next", nextDest);
      return redirect(`/signup?${params.toString()}`);
    }

    const params = new URLSearchParams({ message: "Check email to continue sign in process" });
    if (nextDest) params.set("next", nextDest);
    return redirect(`/signup?${params.toString()}`);
  };

  const signUpWithGoogle = async () => {
    "use server";
    const supabase = await createClient();
    const origin = (await headers()).get("origin");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ""}`,
      },
    });

    if (data.url) {
      redirect(data.url);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Back Button */}
      <Link
        href="/"
        className="absolute left-4 top-4 sm:left-8 sm:top-8 py-2 px-4 rounded-full border border-white/10 text-zinc-400 bg-white/5 hover:bg-white/10 hover:text-white flex items-center group text-sm transition-all backdrop-blur-md z-50"
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Home
      </Link>

      <div className="w-full max-w-md mx-4 p-8 rounded-3xl border border-white/10 bg-zinc-950/50 backdrop-blur-xl shadow-2xl relative z-10 animate-fade-in-up">
        
        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create an account</h1>
          <p className="text-sm text-zinc-400">
            Enter your details below to get started.
          </p>
        </div>

        <form className="flex flex-col gap-4" action={signUp}>
          <input type="hidden" name="next" value={nextUrl} />
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300" htmlFor="email">
              Email Address
            </label>
            <input
              className="rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2 mb-2">
            <label className="text-sm font-medium text-zinc-300" htmlFor="password">
              Password
            </label>
            <input
              className="rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          <SubmitButton className="w-full bg-white text-black hover:bg-zinc-200 font-semibold rounded-xl px-4 py-3 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]" pendingText="Signing Up...">
            Sign Up
          </SubmitButton>

          {searchParams?.message && (
            <div className="mt-2 p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-sm text-center">
              {searchParams.message}
            </div>
          )}
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-950 px-3 text-zinc-500 rounded-full font-medium">
              Or continue with
            </span>
          </div>
        </div>

        <form action={signUpWithGoogle}>
          <SubmitButton variant="outline" className="w-full border border-white/10 bg-white/5 rounded-xl px-4 py-3 flex items-center justify-center gap-3 hover:bg-white/10 text-white font-medium transition-all" pendingText="Redirecting...">
            {/* Google Icon */}
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"></path>
              <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"></path>
              <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"></path>
              <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"></path>
            </svg>
            Continue with Google
          </SubmitButton>
        </form>

        <p className="text-center text-sm text-zinc-400 mt-8">
          Already have an account?{" "}
          <Link href={`/login${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ""}`} className="text-white hover:text-indigo-400 underline decoration-white/30 underline-offset-4 transition-colors font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
