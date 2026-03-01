import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SiteText } from "../../backend.d";
import { useGetSiteText, useUpdateSiteText } from "../../hooks/useQueries";
import { DEFAULT_SITE_TEXT } from "../../lib/siteTextDefaults";

type FormState = SiteText;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display font-bold text-lg text-foreground border-b border-border/40 pb-2 mb-5 mt-8 first:mt-0">
      {children}
    </h3>
  );
}

function FieldRow({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

export default function AdminSiteTextTab() {
  const { data: siteText, isLoading } = useGetSiteText();
  const updateMutation = useUpdateSiteText();

  const [form, setForm] = useState<FormState>(DEFAULT_SITE_TEXT);

  useEffect(() => {
    if (siteText) {
      setForm(siteText);
    }
  }, [siteText]);

  const set =
    (key: keyof SiteText) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync(form);
      toast.success("Site text saved successfully.");
    } catch {
      toast.error("Failed to save site text. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="h-8 bg-muted rounded animate-pulse w-48" />
        {Array.from({ length: 8 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          <div key={i} className="h-10 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl">Site Text</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Edit every piece of visible text on your portfolio. Changes are
          applied live after saving.
        </p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-5">
        {/* ── Navigation ── */}
        <SectionHeading>Navigation</SectionHeading>

        <FieldRow
          id="st-navBrand"
          label="Brand Name"
          hint="Logo/brand name shown in the navbar"
        >
          <Input
            id="st-navBrand"
            value={form.navBrand}
            onChange={set("navBrand")}
            placeholder={DEFAULT_SITE_TEXT.navBrand}
            className="bg-card"
          />
        </FieldRow>

        <div className="grid grid-cols-2 gap-4">
          <FieldRow id="st-navHome" label="Home Link">
            <Input
              id="st-navHome"
              value={form.navHome}
              onChange={set("navHome")}
              placeholder={DEFAULT_SITE_TEXT.navHome}
              className="bg-card"
            />
          </FieldRow>

          <FieldRow id="st-navWork" label="Work Link">
            <Input
              id="st-navWork"
              value={form.navWork}
              onChange={set("navWork")}
              placeholder={DEFAULT_SITE_TEXT.navWork}
              className="bg-card"
            />
          </FieldRow>

          <FieldRow id="st-navAbout" label="About Link">
            <Input
              id="st-navAbout"
              value={form.navAbout}
              onChange={set("navAbout")}
              placeholder={DEFAULT_SITE_TEXT.navAbout}
              className="bg-card"
            />
          </FieldRow>

          <FieldRow id="st-navContact" label="Contact Link">
            <Input
              id="st-navContact"
              value={form.navContact}
              onChange={set("navContact")}
              placeholder={DEFAULT_SITE_TEXT.navContact}
              className="bg-card"
            />
          </FieldRow>
        </div>

        {/* ── Hero ── */}
        <SectionHeading>Hero Section</SectionHeading>

        <FieldRow
          id="st-heroBadge"
          label="Badge Text"
          hint="Small pill shown above the main title"
        >
          <Input
            id="st-heroBadge"
            value={form.heroBadge}
            onChange={set("heroBadge")}
            placeholder={DEFAULT_SITE_TEXT.heroBadge}
            className="bg-card"
          />
        </FieldRow>

        <FieldRow
          id="st-heroName"
          label="Name / Title"
          hint="The large heading (your brand name)"
        >
          <Input
            id="st-heroName"
            value={form.heroName}
            onChange={set("heroName")}
            placeholder={DEFAULT_SITE_TEXT.heroName}
            className="bg-card"
          />
        </FieldRow>

        <FieldRow
          id="st-heroSubtitle"
          label="Subtitle"
          hint="Appears below your name in uppercase"
        >
          <Input
            id="st-heroSubtitle"
            value={form.heroSubtitle}
            onChange={set("heroSubtitle")}
            placeholder={DEFAULT_SITE_TEXT.heroSubtitle}
            className="bg-card"
          />
        </FieldRow>

        <FieldRow
          id="st-heroDescription"
          label="Description"
          hint="Short bio paragraph in the hero"
        >
          <Textarea
            id="st-heroDescription"
            value={form.heroDescription}
            onChange={set("heroDescription")}
            placeholder={DEFAULT_SITE_TEXT.heroDescription}
            rows={3}
            className="bg-card resize-none"
          />
        </FieldRow>

        <FieldRow id="st-heroCta1" label="Primary Button">
          <Input
            id="st-heroCta1"
            value={form.heroCta1}
            onChange={set("heroCta1")}
            placeholder={DEFAULT_SITE_TEXT.heroCta1}
            className="bg-card"
          />
        </FieldRow>

        <FieldRow id="st-heroCta2" label="Secondary Button">
          <Input
            id="st-heroCta2"
            value={form.heroCta2}
            onChange={set("heroCta2")}
            placeholder={DEFAULT_SITE_TEXT.heroCta2}
            className="bg-card"
          />
        </FieldRow>

        <FieldRow id="st-heroScroll" label="Scroll Indicator Label">
          <Input
            id="st-heroScroll"
            value={form.heroScroll}
            onChange={set("heroScroll")}
            placeholder={DEFAULT_SITE_TEXT.heroScroll}
            className="bg-card"
          />
        </FieldRow>

        {/* ── Work Section ── */}
        <SectionHeading>Work Section</SectionHeading>

        <FieldRow
          id="st-workLabel"
          label="Section Label"
          hint="Small uppercase label above heading"
        >
          <Input
            id="st-workLabel"
            value={form.workLabel}
            onChange={set("workLabel")}
            placeholder={DEFAULT_SITE_TEXT.workLabel}
            className="bg-card"
          />
        </FieldRow>

        <FieldRow id="st-workHeading" label="Heading">
          <Input
            id="st-workHeading"
            value={form.workHeading}
            onChange={set("workHeading")}
            placeholder={DEFAULT_SITE_TEXT.workHeading}
            className="bg-card"
          />
        </FieldRow>

        <FieldRow id="st-workDescription" label="Description">
          <Textarea
            id="st-workDescription"
            value={form.workDescription}
            onChange={set("workDescription")}
            placeholder={DEFAULT_SITE_TEXT.workDescription}
            rows={2}
            className="bg-card resize-none"
          />
        </FieldRow>

        {/* ── Gallery ── */}
        <SectionHeading>Gallery / Other Works</SectionHeading>

        <FieldRow id="st-galleryLabel" label="Section Label">
          <Input
            id="st-galleryLabel"
            value={form.galleryLabel}
            onChange={set("galleryLabel")}
            placeholder={DEFAULT_SITE_TEXT.galleryLabel}
            className="bg-card"
          />
        </FieldRow>

        <FieldRow id="st-galleryHeading" label="Heading">
          <Input
            id="st-galleryHeading"
            value={form.galleryHeading}
            onChange={set("galleryHeading")}
            placeholder={DEFAULT_SITE_TEXT.galleryHeading}
            className="bg-card"
          />
        </FieldRow>

        <FieldRow id="st-galleryDescription" label="Description">
          <Textarea
            id="st-galleryDescription"
            value={form.galleryDescription}
            onChange={set("galleryDescription")}
            placeholder={DEFAULT_SITE_TEXT.galleryDescription}
            rows={2}
            className="bg-card resize-none"
          />
        </FieldRow>

        {/* ── About ── */}
        <SectionHeading>About Section</SectionHeading>

        <FieldRow id="st-aboutLabel" label="Section Label">
          <Input
            id="st-aboutLabel"
            value={form.aboutLabel}
            onChange={set("aboutLabel")}
            placeholder={DEFAULT_SITE_TEXT.aboutLabel}
            className="bg-card"
          />
        </FieldRow>

        <FieldRow id="st-aboutHeading" label="Heading">
          <Input
            id="st-aboutHeading"
            value={form.aboutHeading}
            onChange={set("aboutHeading")}
            placeholder={DEFAULT_SITE_TEXT.aboutHeading}
            className="bg-card"
          />
        </FieldRow>

        {/* ── Stats ── */}
        <SectionHeading>Stats (About Section)</SectionHeading>

        <div className="grid grid-cols-3 gap-4">
          <FieldRow id="st-stat1Value" label="Stat 1 Value">
            <Input
              id="st-stat1Value"
              value={form.stat1Value}
              onChange={set("stat1Value")}
              placeholder={DEFAULT_SITE_TEXT.stat1Value}
              className="bg-card"
            />
          </FieldRow>
          <FieldRow id="st-stat2Value" label="Stat 2 Value">
            <Input
              id="st-stat2Value"
              value={form.stat2Value}
              onChange={set("stat2Value")}
              placeholder={DEFAULT_SITE_TEXT.stat2Value}
              className="bg-card"
            />
          </FieldRow>
          <FieldRow id="st-stat3Value" label="Stat 3 Value">
            <Input
              id="st-stat3Value"
              value={form.stat3Value}
              onChange={set("stat3Value")}
              placeholder={DEFAULT_SITE_TEXT.stat3Value}
              className="bg-card"
            />
          </FieldRow>

          <FieldRow id="st-stat1Label" label="Stat 1 Label">
            <Input
              id="st-stat1Label"
              value={form.stat1Label}
              onChange={set("stat1Label")}
              placeholder={DEFAULT_SITE_TEXT.stat1Label}
              className="bg-card"
            />
          </FieldRow>
          <FieldRow id="st-stat2Label" label="Stat 2 Label">
            <Input
              id="st-stat2Label"
              value={form.stat2Label}
              onChange={set("stat2Label")}
              placeholder={DEFAULT_SITE_TEXT.stat2Label}
              className="bg-card"
            />
          </FieldRow>
          <FieldRow id="st-stat3Label" label="Stat 3 Label">
            <Input
              id="st-stat3Label"
              value={form.stat3Label}
              onChange={set("stat3Label")}
              placeholder={DEFAULT_SITE_TEXT.stat3Label}
              className="bg-card"
            />
          </FieldRow>
        </div>

        {/* ── Contact ── */}
        <SectionHeading>Contact Section</SectionHeading>

        <FieldRow id="st-contactLabel" label="Section Label">
          <Input
            id="st-contactLabel"
            value={form.contactLabel}
            onChange={set("contactLabel")}
            placeholder={DEFAULT_SITE_TEXT.contactLabel}
            className="bg-card"
          />
        </FieldRow>

        <FieldRow id="st-contactHeading" label="Heading">
          <Input
            id="st-contactHeading"
            value={form.contactHeading}
            onChange={set("contactHeading")}
            placeholder={DEFAULT_SITE_TEXT.contactHeading}
            className="bg-card"
          />
        </FieldRow>

        <FieldRow id="st-contactDescription" label="Description">
          <Textarea
            id="st-contactDescription"
            value={form.contactDescription}
            onChange={set("contactDescription")}
            placeholder={DEFAULT_SITE_TEXT.contactDescription}
            rows={2}
            className="bg-card resize-none"
          />
        </FieldRow>

        <FieldRow id="st-contactGetInTouch" label='"Get in Touch" Column Title'>
          <Input
            id="st-contactGetInTouch"
            value={form.contactGetInTouch}
            onChange={set("contactGetInTouch")}
            placeholder={DEFAULT_SITE_TEXT.contactGetInTouch}
            className="bg-card"
          />
        </FieldRow>

        <FieldRow
          id="st-contactSendMessage"
          label='"Send a Message" Column Title'
        >
          <Input
            id="st-contactSendMessage"
            value={form.contactSendMessage}
            onChange={set("contactSendMessage")}
            placeholder={DEFAULT_SITE_TEXT.contactSendMessage}
            className="bg-card"
          />
        </FieldRow>

        {/* ── Footer ── */}
        <SectionHeading>Footer</SectionHeading>

        <FieldRow
          id="st-footerName"
          label="Footer Name"
          hint="Name shown in the copyright line"
        >
          <Input
            id="st-footerName"
            value={form.footerName}
            onChange={set("footerName")}
            placeholder={DEFAULT_SITE_TEXT.footerName}
            className="bg-card"
          />
        </FieldRow>

        {/* Save */}
        <div className="pt-4 pb-8">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="min-w-32"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
