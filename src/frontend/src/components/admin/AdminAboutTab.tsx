import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Upload, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useGetAboutMe, useUpdateAboutMe } from "../../hooks/useQueries";
import { ExternalBlob } from "../../utils/ExternalBlob";
import { uploadFile } from "../../utils/uploadFile";

export default function AdminAboutTab() {
  const { data: about, isLoading } = useGetAboutMe();
  const updateMutation = useUpdateAboutMe();

  const [bio, setBio] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [profileBlobId, setProfileBlobId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (about) {
      setBio(about.bio);
      setIsVisible(about.isVisible);
      setProfileBlobId(about.profilePhotoBlobId ?? null);
    }
  }, [about]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadFile(file, "profile", (pct) =>
        setUploadProgress(pct),
      );
      setProfileBlobId(url);
      toast.success("Photo uploaded.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload photo.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        bio,
        profilePhotoBlobId: profileBlobId,
        isVisible,
      });
      toast.success("About section updated.");
    } catch {
      toast.error("Failed to save changes.");
    }
  };

  const profileUrl = profileBlobId
    ? ExternalBlob.fromURL(profileBlobId).getDirectURL()
    : null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded animate-pulse w-32" />
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="h-10 bg-muted rounded animate-pulse w-24" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-2xl">About Section</h2>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Visibility toggle */}
        <div className="flex items-center justify-between p-4 glass rounded-xl">
          <div>
            <p className="font-medium text-sm">Show About Section</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              When disabled, the About section is hidden from visitors.
            </p>
          </div>
          <Switch
            checked={isVisible}
            onCheckedChange={setIsVisible}
            aria-label="Toggle about section visibility"
          />
        </div>

        {/* Profile photo */}
        <div className="space-y-3">
          <Label>Profile Photo</Label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-muted shrink-0 flex items-center justify-center">
              {profileUrl ? (
                <img
                  src={profileUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-muted-foreground/40" />
              )}
            </div>

            <div className="flex-1">
              {uploading ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              ) : (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="profile-upload"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {profileUrl ? "Change Photo" : "Upload Photo"}
                    </Button>
                    {profileBlobId && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setProfileBlobId(null)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="about-bio">Bio</Label>
          <Textarea
            id="about-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something about yourself..."
            rows={8}
            className="bg-card resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {bio.length} characters
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="w-full"
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
