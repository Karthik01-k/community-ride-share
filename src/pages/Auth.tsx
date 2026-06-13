import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Zap, ArrowLeft } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
  name: z.string().min(2).optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) navigate("/dashboard"); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/dashboard");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      authSchema.parse({ email, password, name: mode === "signup" ? name : undefined });
      setLoading(true);
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { name }, emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast({ title: "Welcome aboard!", description: "Account ready. Start raiding." });
      }
    } catch (err: any) {
      const msg = err instanceof z.ZodError ? err.errors[0].message : err.message;
      toast({ title: "Couldn't sign in", description: msg, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="bg-white rounded-3xl border border-border shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-2xl bg-[hsl(var(--primary))] flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-display text-xl">Welcome Back!</p>
              <p className="text-xs text-muted-foreground">Login or sign up to continue</p>
            </div>
          </div>

          <div className="grid grid-cols-2 p-1 bg-muted rounded-xl mb-6">
            <button onClick={() => setMode("signin")}
              className={`py-2 rounded-lg text-sm font-semibold transition ${mode === "signin" ? "bg-white shadow-sm" : "text-muted-foreground"}`}>
              Sign In
            </button>
            <button onClick={() => setMode("signup")}
              className={`py-2 rounded-lg text-sm font-semibold transition ${mode === "signup" ? "bg-white shadow-sm" : "text-muted-foreground"}`}>
              Sign Up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Ritwiz" className="rounded-xl h-12" required />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com" className="rounded-xl h-12" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className="rounded-xl h-12" required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 mt-2">
              {loading ? "Please wait…" : mode === "signin" ? "Proceed" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
