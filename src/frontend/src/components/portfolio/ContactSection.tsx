import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Instagram, Mail, MessageSquare, Phone, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { SiteText } from "../../backend.d";
import {
  useGetContactInfo,
  useSubmitContactForm,
} from "../../hooks/useQueries";
import { DEFAULT_SITE_TEXT } from "../../lib/siteTextDefaults";

interface ContactSectionProps {
  siteText?: SiteText;
}

export default function ContactSection({ siteText }: ContactSectionProps) {
  const text = siteText ?? DEFAULT_SITE_TEXT;
  const sectionRef = useRef<HTMLElement>(null);
  const { data: contact, isLoading: contactLoading } = useGetContactInfo();
  const submitMutation = useSubmitContactForm();

  const [form, setForm] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
    );

    for (const item of Array.from(section.querySelectorAll(".reveal"))) {
      observer.observe(item);
    }
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      await submitMutation.mutateAsync(form);
      toast.success("Message sent! I'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  };

  const contactItems = [
    contact?.instagram && {
      icon: Instagram,
      label: "Instagram",
      value: contact.instagram,
      href: contact.instagram.startsWith("http")
        ? contact.instagram
        : `https://instagram.com/${contact.instagram.replace("@", "")}`,
    },
    contact?.email && {
      icon: Mail,
      label: "Email",
      value: contact.email,
      href: `mailto:${contact.email}`,
    },
    contact?.phone && {
      icon: Phone,
      label: "Phone",
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s/g, "")}`,
    },
  ].filter(Boolean) as Array<{
    icon: typeof Mail;
    label: string;
    value: string;
    href: string;
  }>;

  return (
    <section id="contact" ref={sectionRef} className="py-24 md:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <div className="reveal flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 text-primary">
              <MessageSquare className="w-4 h-4" />
              <span className="font-mono-custom text-xs uppercase tracking-widest">
                {text.contactLabel}
              </span>
            </div>
            <div className="h-px flex-1 bg-border max-w-24" />
          </div>

          <h2 className="reveal font-display font-black text-[clamp(2.5rem,6vw,4rem)] leading-tight gradient-text mb-4">
            {text.contactHeading}
          </h2>
          <p className="reveal text-muted-foreground text-lg max-w-md">
            {text.contactDescription}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="reveal space-y-6">
            <h3 className="font-display font-bold text-xl text-foreground">
              {text.contactGetInTouch}
            </h3>

            {contactLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 rounded-2xl bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : contactItems.length > 0 ? (
              <div className="space-y-3">
                {contactItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 p-4 glass rounded-2xl hover:bg-white/8 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {item.value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Contact details coming soon.
              </div>
            )}
          </div>

          {/* Contact form */}
          <form onSubmit={handleSubmit} className="reveal space-y-4" noValidate>
            <h3 className="font-display font-bold text-xl text-foreground">
              {text.contactSendMessage}
            </h3>

            <div className="space-y-2">
              <Label
                htmlFor="contact-name"
                className="text-sm text-muted-foreground"
              >
                Name
              </Label>
              <Input
                id="contact-name"
                name="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Your name"
                required
                className="bg-card border-border/50 focus:border-primary rounded-xl"
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="contact-email"
                className="text-sm text-muted-foreground"
              >
                Email
              </Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="your@email.com"
                required
                className="bg-card border-border/50 focus:border-primary rounded-xl"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="contact-message"
                className="text-sm text-muted-foreground"
              >
                Message
              </Label>
              <Textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                placeholder="Tell me about your project..."
                required
                rows={5}
                className="bg-card border-border/50 focus:border-primary rounded-xl resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-3 transition-all hover:shadow-blue-glow"
            >
              {submitMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
