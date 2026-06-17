import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, ShieldCheck, FileCheck, Camera, Check, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type DocKey = "license" | "rc" | "insurance" | "photos";
const docs: { key: DocKey; icon: typeof FileText; label: string; accept: string }[] = [
  { key: "license", icon: FileText, label: "Driving License", accept: "image/*,application/pdf" },
  { key: "rc", icon: FileCheck, label: "RC (Registration Certificate)", accept: "image/*,application/pdf" },
  { key: "insurance", icon: ShieldCheck, label: "Insurance", accept: "image/*,application/pdf" },
  { key: "photos", icon: Camera, label: "Vehicle Photos", accept: "image/*" },
];

const BecomeCaptain = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<Record<DocKey, File | null>>({
    license: null, rc: null, insurance: null, photos: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const refs = useRef<Record<DocKey, HTMLInputElement | null>>({
    license: null, rc: null, insurance: null, photos: null,
  });

  const pick = (key: DocKey) => refs.current[key]?.click();
  const onFile = (key: DocKey, f: File | null) => {
    if (f && f.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB per document.", variant: "destructive" });
      return;
    }
    setFiles((p) => ({ ...p, [key]: f }));
  };

  const handleApply = async () => {
    const missing = docs.filter((d) => !files[d.key]);
    if (missing.length) {
      toast({
        title: "Documents required",
        description: `Please upload: ${missing.map((m) => m.label).join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    toast({ title: "Application submitted", description: "We'll review your documents within 24–48 hours." });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-full bg-background px-4 sm:px-6 md:px-10 py-8 max-w-[700px] mx-auto">
      <Link to="/dashboard" className="inline-flex h-10 w-10 rounded-xl bg-white border border-border items-center justify-center mb-6">
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <div className="text-center mb-8">
        <h1 className="font-display text-2xl md:text-3xl">Become a Captain</h1>
        <p className="text-sm text-muted-foreground mt-2">Join our captain partner program and earn more!</p>
      </div>

      <h2 className="font-display text-base mb-3">Upload Documents</h2>
      <div className="space-y-3 mb-8">
        {docs.map((d) => {
          const f = files[d.key];
          return (
            <div key={d.key} className="lambo-card flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-[hsl(var(--indigo-soft))] flex items-center justify-center">
                <d.icon className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{d.label}</p>
                {f && <p className="text-xs text-muted-foreground truncate">{f.name}</p>}
              </div>
              <input
                ref={(el) => (refs.current[d.key] = el)}
                type="file"
                accept={d.accept}
                className="hidden"
                onChange={(e) => onFile(d.key, e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => pick(d.key)}
                className="text-xs font-semibold text-[hsl(var(--primary))] inline-flex items-center gap-1.5"
              >
                {f ? <><Check className="h-3.5 w-3.5" /> Replace</> : <><Upload className="h-3.5 w-3.5" /> Upload</>}
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleApply}
        disabled={submitting}
        className="btn-primary w-full h-14 text-base disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Apply Now"}
      </button>
    </div>
  );
};

export default BecomeCaptain;
