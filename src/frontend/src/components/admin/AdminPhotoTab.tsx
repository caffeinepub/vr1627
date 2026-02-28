import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Image, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAddPhoto,
  useDeletePhoto,
  useGetPhotos,
} from "../../hooks/useQueries";
import { ExternalBlob } from "../../utils/ExternalBlob";
import { uploadFile } from "../../utils/uploadFile";

export default function AdminPhotoTab() {
  const { data: photos = [], isLoading } = useGetPhotos();
  const addMutation = useAddPhoto();
  const deleteMutation = useDeletePhoto();

  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 20MB.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const blobId = await uploadFile(file, "photos", (pct) =>
        setUploadProgress(pct),
      );

      await addMutation.mutateAsync({
        blobId,
        title: title.trim() || file.name.replace(/\.[^/.]+$/, ""),
      });

      toast.success("Photo uploaded successfully.");
      setTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload photo.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Photo deleted.");
    } catch {
      toast.error("Failed to delete photo.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-2xl">Photos</h2>
      </div>

      {/* Upload section */}
      <div className="mb-8 p-6 glass rounded-2xl space-y-4">
        <h3 className="font-semibold">Upload Photo</h3>

        <div className="space-y-2">
          <Label htmlFor="photo-title">Title (optional)</Label>
          <Input
            id="photo-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Photo title..."
            className="bg-card"
            disabled={uploading}
          />
        </div>

        {uploading ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading... {uploadProgress}%
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="flex flex-col items-center justify-center gap-3 w-full p-8 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-white/3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload a photo</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WebP up to 20MB
                </p>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Photo grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <Image className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground">No photos yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => {
            const url = ExternalBlob.fromURL(photo.blobId).getDirectURL();
            return (
              <div
                key={String(photo.id)}
                className="group relative aspect-square"
              >
                <div className="w-full h-full rounded-xl overflow-hidden bg-muted">
                  <img
                    src={url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {photo.title && (
                  <p className="mt-1 text-xs text-muted-foreground truncate px-1">
                    {photo.title}
                  </p>
                )}

                {/* Delete button overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-7 w-7 shadow-lg"
                        aria-label="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this photo? This
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(photo.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
