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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronUp,
  Image,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAddPhoto,
  useDeletePhoto,
  useGetPhotoCategories,
  useGetPhotos,
  useUpdatePhotoCategories,
} from "../../hooks/useQueries";
import { ExternalBlob } from "../../utils/ExternalBlob";
import { uploadFile } from "../../utils/uploadFile";

function ManageCategoriesSection() {
  const { data: categories = [] } = useGetPhotoCategories();
  const updateMutation = useUpdatePhotoCategories();
  const [newCat, setNewCat] = useState("");
  const [localCats, setLocalCats] = useState<string[] | null>(null);

  const displayCats = localCats ?? categories;

  const handleAdd = () => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    if (displayCats.includes(trimmed)) {
      toast.error("Category already exists.");
      return;
    }
    setLocalCats([...displayCats, trimmed]);
    setNewCat("");
  };

  const handleRemove = (cat: string) => {
    setLocalCats(displayCats.filter((c) => c !== cat));
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(displayCats);
      setLocalCats(null);
      toast.success("Categories saved.");
    } catch {
      toast.error("Failed to save categories.");
    }
  };

  const isDirty =
    localCats !== null &&
    JSON.stringify(localCats) !== JSON.stringify(categories);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {displayCats.map((cat) => (
          <div
            key={cat}
            className="flex items-center gap-1 px-3 py-1 glass rounded-full text-sm"
          >
            <span>{cat}</span>
            <button
              type="button"
              onClick={() => handleRemove(cat)}
              className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
              aria-label={`Remove ${cat}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {displayCats.length === 0 && (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="New category name..."
          className="bg-card flex-1"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleAdd}
          disabled={!newCat.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {isDirty && (
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          size="sm"
          className="bg-primary text-primary-foreground"
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : null}
          Save Categories
        </Button>
      )}
    </div>
  );
}

export default function AdminPhotoTab() {
  const { data: photos = [], isLoading } = useGetPhotos();
  const { data: categories = [] } = useGetPhotoCategories();
  const addMutation = useAddPhoto();
  const deleteMutation = useDeletePhoto();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCategories, setShowCategories] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title.trim()) {
      toast.error("Please add a title for this photo.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

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
        title: title.trim(),
        category: category.trim() || "Uncategorized",
      });

      toast.success("Photo uploaded successfully.");
      setTitle("");
      setCategory("");
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

      {/* Manage Categories */}
      <div className="mb-6 glass rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCategories((v) => !v)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
        >
          <span className="font-semibold text-sm">Manage Categories</span>
          {showCategories ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {showCategories && (
          <div className="p-4 pt-0 border-t border-border/20">
            <ManageCategoriesSection />
          </div>
        )}
      </div>

      {/* Upload section */}
      <div className="mb-8 p-6 glass rounded-2xl space-y-4">
        <h3 className="font-semibold">Upload Photo</h3>

        <div className="space-y-2">
          <Label htmlFor="photo-title" className="flex items-center gap-1">
            Title{" "}
            <span className="text-destructive font-bold" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="photo-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Photo title..."
            className="bg-card"
            disabled={uploading}
            required
          />
        </div>

        {/* Category field */}
        <div className="space-y-2">
          <Label htmlFor="photo-category">Category</Label>
          <Input
            id="photo-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Portrait, Street, Nature..."
            className="bg-card"
            disabled={uploading}
            list="photo-category-suggestions"
          />
          <datalist id="photo-category-suggestions">
            {categories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
          <p className="text-xs text-muted-foreground">
            Leave blank to use "Uncategorized"
          </p>
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
              <div key={String(photo.id)} className="group relative">
                <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                  <img
                    src={url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {photo.title && (
                  <p className="mt-1 text-sm font-medium text-foreground truncate px-1">
                    {photo.title}
                  </p>
                )}
                {photo.category && (
                  <Badge
                    variant="outline"
                    className="mt-1 text-xs glass border-white/10 text-muted-foreground"
                  >
                    {photo.category}
                  </Badge>
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
