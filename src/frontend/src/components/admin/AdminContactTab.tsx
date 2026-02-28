import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram, Loader2, Mail, Phone, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useGetContactInfo,
  useUpdateContactInfo,
} from "../../hooks/useQueries";

export default function AdminContactTab() {
  const { data: contact, isLoading } = useGetContactInfo();
  const updateMutation = useUpdateContactInfo();

  const [form, setForm] = useState({
    instagram: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (contact) {
      setForm({
        instagram: contact.instagram,
        email: contact.email,
        phone: contact.phone,
      });
    }
  }, [contact]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync(form);
      toast.success("Contact info updated.");
    } catch {
      toast.error("Failed to save contact info.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-lg">
        <div className="h-6 bg-muted rounded animate-pulse w-32" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl">Contact Info</h2>
        <p className="text-muted-foreground text-sm mt-1">
          These details appear in the Contact section of your portfolio.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 max-w-lg">
        <div className="space-y-2">
          <Label
            htmlFor="contact-instagram"
            className="flex items-center gap-2"
          >
            <Instagram className="w-4 h-4 text-muted-foreground" />
            Instagram
          </Label>
          <Input
            id="contact-instagram"
            value={form.instagram}
            onChange={(e) =>
              setForm((f) => ({ ...f, instagram: e.target.value }))
            }
            placeholder="@yourusername or https://instagram.com/..."
            className="bg-card"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-email" className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            Email
          </Label>
          <Input
            id="admin-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="your@email.com"
            className="bg-card"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            Phone
          </Label>
          <Input
            id="admin-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+1 234 567 8900"
            className="bg-card"
            autoComplete="tel"
          />
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Contact Info
          </Button>
        </div>
      </form>
    </div>
  );
}
