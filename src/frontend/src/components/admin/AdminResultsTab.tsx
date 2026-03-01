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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart2, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAddResult,
  useDeleteResult,
  useGetResults,
} from "../../hooks/useQueries";
import { ExternalBlob } from "../../utils/ExternalBlob";
import { uploadFile } from "../../utils/uploadFile";

const RESULT_CATEGORIES = [
  "Client Feedback",
  "Result Screenshot",
  "YT Analytics",
];

export default function AdminResultsTab() {
  const { data: results = [], isLoading } = useGetResults();
  const addMutation = useAddResult();
  const deleteMutation = useDeleteResult();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(RESULT_CATEGORIES[0]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title.trim()) {
      toast.error("Please add a title for this screenshot.");
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
      const blobId = await uploadFile(file, "results", (pct) =>
        setUploadProgress(pct),
      );

      await addMutation.mutateAsync({
        blobId,
        title: title.trim(),
        category,
      });

      toast.success("Screenshot uploaded successfully.");
      setTitle("");
      setCategory(RESULT_CATEGORIES[0]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload screenshot.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Screenshot deleted.");
    } catch {
      toast.error("Failed to delete screenshot.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl">
            Results & Feedback
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Upload client feedback screenshots, result proofs, and YT analytics.
          </p>
        </div>
      </div>

      {/* Upload section */}
      <div className="mb-8 p-6 glass rounded-2xl space-y-4">
        <h3 className="font-semibold">Upload Screenshot</h3>

        <div className="space-y-2">
          <Label htmlFor="result-title" className="flex items-center gap-1">
            Title{" "}
            <span className="text-destructive font-bold" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="result-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 100K views milestone, Client review..."
            className="bg-card"
            disabled={uploading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="result-category">Category</Label>
          <Select
            value={category}
            onValueChange={setCategory}
            disabled={uploading}
          >
            <SelectTrigger id="result-category" className="bg-card">
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              {RESULT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              id="result-upload"
            />
            <label
              htmlFor="result-upload"
              className="flex flex-col items-center justify-center gap-3 w-full p-8 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-white/3 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  Click to upload a screenshot
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WebP up to 20MB
                </p>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Results grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-video rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <BarChart2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground">No screenshots yet.</p>
          <p className="text-muted-foreground/60 text-sm mt-1">
            Upload client feedback, result proofs, and analytics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {results.map((item) => {
            const url = ExternalBlob.fromURL(item.blobId).getDirectURL();
            return (
              <div key={String(item.id)} className="group relative">
                <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                  <img
                    src={url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {item.title && (
                  <p className="mt-1 text-sm font-medium text-foreground truncate px-1">
                    {item.title}
                  </p>
                )}
                {item.category && (
                  <Badge
                    variant="outline"
                    className="mt-1 text-xs glass border-white/10 text-muted-foreground"
                  >
                    {item.category}
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
                        aria-label="Delete screenshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Screenshot</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this screenshot? This
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(item.id)}
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
