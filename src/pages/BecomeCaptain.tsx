import { Link } from "react-router-dom";
import { ArrowLeft, Upload, FileText, ShieldCheck, FileCheck, Camera } from "lucide-react";

const docs = [
  { icon: FileText, label: "Driving License" },
  { icon: FileCheck, label: "RC (Registration Certificate)" },
  { icon: ShieldCheck, label: "Insurance" },
  { icon: Camera, label: "Vehicle Photos" },
];

const BecomeCaptain = () => (
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
      {docs.map((d) => (
        <div key={d.label} className="lambo-card flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-[hsl(var(--indigo-soft))] flex items-center justify-center">
            <d.icon className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <p className="flex-1 font-semibold text-sm">{d.label}</p>
          <button className="text-xs font-semibold text-[hsl(var(--primary))] inline-flex items-center gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Upload
          </button>
        </div>
      ))}
    </div>

    <button className="btn-primary w-full h-14 text-base">Apply Now</button>
  </div>
);

export default BecomeCaptain;
