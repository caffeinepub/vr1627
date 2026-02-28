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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Film, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Category, type NewVideoInput, type Video } from "../../backend.d";
import {
  useAddVideo,
  useDeleteVideo,
  useGetVideos,
  useUpdateVideo,
} from "../../hooks/useQueries";

const CATEGORY_LABELS: Record<Category, string> = {
  categoryShorts: "Shorts",
  categoryLongVideos: "Long Videos",
  categoryClientWork: "Client Work",
};

function extractYoutubeId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\s?#]+)/,
    /youtube\.com\/shorts\/([^&\s?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return "";
}

interface VideoFormState {
  youtubeUrl: string;
  title: string;
  description: string;
  category: Category;
  sortOrder: string;
}

const DEFAULT_FORM: VideoFormState = {
  youtubeUrl: "",
  title: "",
  description: "",
  category: Category.categoryShorts,
  sortOrder: "0",
};

interface VideoFormProps {
  initial?: VideoFormState;
  onSubmit: (data: NewVideoInput) => Promise<void>;
  onCancel: () => void;
  isPending: boolean;
  mode: "add" | "edit";
}

function VideoForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
  mode,
}: VideoFormProps) {
  const [form, setForm] = useState<VideoFormState>(initial ?? DEFAULT_FORM);
  const youtubeId = extractYoutubeId(form.youtubeUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.youtubeUrl.trim() || !form.title.trim()) {
      toast.error("YouTube URL and title are required.");
      return;
    }
    if (!youtubeId) {
      toast.error("Invalid YouTube URL. Please enter a valid YouTube link.");
      return;
    }
    await onSubmit({
      youtubeUrl: form.youtubeUrl.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      sortOrder: BigInt(Number.parseInt(form.sortOrder) || 0),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="yt-url">YouTube URL *</Label>
        <Input
          id="yt-url"
          value={form.youtubeUrl}
          onChange={(e) =>
            setForm((f) => ({ ...f, youtubeUrl: e.target.value }))
          }
          placeholder="https://youtube.com/watch?v=..."
          className="bg-card"
        />
        {form.youtubeUrl && (
          <p
            className={`text-xs ${youtubeId ? "text-primary" : "text-destructive"}`}
          >
            {youtubeId ? `Video ID: ${youtubeId}` : "Invalid YouTube URL"}
          </p>
        )}
      </div>

      {youtubeId && (
        <div className="rounded-xl overflow-hidden aspect-video bg-black max-w-xs">
          <img
            src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
            alt="Thumbnail preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="yt-title">Title *</Label>
        <Input
          id="yt-title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Video title"
          className="bg-card"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="yt-desc">Description</Label>
        <Textarea
          id="yt-desc"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="Short description..."
          rows={3}
          className="bg-card resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={form.category}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, category: v as Category }))
            }
          >
            <SelectTrigger className="bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="yt-order">Sort Order</Label>
          <Input
            id="yt-order"
            type="number"
            value={form.sortOrder}
            onChange={(e) =>
              setForm((f) => ({ ...f, sortOrder: e.target.value }))
            }
            placeholder="0"
            className="bg-card"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Film className="w-4 h-4 mr-2" />
          )}
          {mode === "add" ? "Add Video" : "Update Video"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function AdminVideoTab() {
  const { data: videos = [], isLoading } = useGetVideos();
  const addMutation = useAddVideo();
  const updateMutation = useUpdateVideo();
  const deleteMutation = useDeleteVideo();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);

  const editingVideo = videos.find((v) => v.id === editingId);
  const editingInitial: VideoFormState | undefined = editingVideo
    ? {
        youtubeUrl: editingVideo.youtubeUrl,
        title: editingVideo.title,
        description: editingVideo.description,
        category: editingVideo.category,
        sortOrder: String(editingVideo.sortOrder),
      }
    : undefined;

  const handleAdd = async (input: NewVideoInput) => {
    try {
      await addMutation.mutateAsync(input);
      toast.success("Video added successfully.");
      setShowAddForm(false);
    } catch {
      toast.error("Failed to add video.");
    }
  };

  const handleUpdate = async (input: NewVideoInput) => {
    if (editingId === null) return;
    try {
      await updateMutation.mutateAsync({ id: editingId, input });
      toast.success("Video updated.");
      setEditingId(null);
    } catch {
      toast.error("Failed to update video.");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Video deleted.");
    } catch {
      toast.error("Failed to delete video.");
    }
  };

  const sortedVideos = [...videos].sort(
    (a, b) => Number(a.sortOrder) - Number(b.sortOrder),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-2xl">Videos</h2>
        {!showAddForm && editingId === null && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Video
          </Button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="mb-8 p-6 glass rounded-2xl">
          <h3 className="font-semibold mb-4">Add New Video</h3>
          <VideoForm
            onSubmit={handleAdd}
            onCancel={() => setShowAddForm(false)}
            isPending={addMutation.isPending}
            mode="add"
          />
        </div>
      )}

      {/* Edit form */}
      {editingId !== null && editingInitial && (
        <div className="mb-8 p-6 glass rounded-2xl">
          <h3 className="font-semibold mb-4">Edit Video</h3>
          <VideoForm
            initial={editingInitial}
            onSubmit={handleUpdate}
            onCancel={() => setEditingId(null)}
            isPending={updateMutation.isPending}
            mode="edit"
          />
        </div>
      )}

      {/* Video list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : sortedVideos.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <Film className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            No videos yet. Add your first one!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedVideos.map((video) => (
            <div
              key={String(video.id)}
              className="flex items-center gap-4 p-4 glass rounded-xl hover:bg-white/5 transition-colors"
            >
              {/* Thumbnail */}
              <div className="shrink-0 w-24 h-14 rounded-lg overflow-hidden bg-muted">
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{video.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {CATEGORY_LABELS[video.category]}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    Order: {String(video.sortOrder)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingId(video.id)}
                  className="h-8 w-8"
                  aria-label="Edit video"
                >
                  <Pencil className="w-4 h-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      aria-label="Delete video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Video</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{video.title}"? This
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(video.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
