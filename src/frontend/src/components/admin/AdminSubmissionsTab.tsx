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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mail, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useDeleteContactFormSubmission,
  useGetContactFormSubmissions,
} from "../../hooks/useQueries";

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminSubmissionsTab() {
  const { data: submissions = [], isLoading } = useGetContactFormSubmissions();
  const deleteMutation = useDeleteContactFormSubmission();

  const handleDelete = async (index: number) => {
    try {
      await deleteMutation.mutateAsync(BigInt(index));
      toast.success("Submission deleted.");
    } catch {
      toast.error("Failed to delete submission.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-2xl">Contact Submissions</h2>
        {submissions.length > 0 && (
          <span className="text-xs text-muted-foreground font-mono-custom">
            {submissions.length} message{submissions.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground">No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mobile: card layout */}
          <div className="md:hidden space-y-3">
            {submissions.map((sub, i) => (
              <div
                key={`${sub.email}-${sub.submittedAt}-${i}`}
                className="p-4 glass rounded-xl space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{sub.name}</p>
                    <a
                      href={`mailto:${sub.email}`}
                      className="text-primary text-xs flex items-center gap-1 hover:underline"
                    >
                      <Mail className="w-3 h-3" />
                      {sub.email}
                    </a>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                        <AlertDialogDescription>
                          Delete message from {sub.name}?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(i)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <p className="text-sm text-foreground/80 line-clamp-3">
                  {sub.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(sub.submittedAt)}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop: table layout */}
          <div className="hidden md:block">
            <div className="glass rounded-2xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Name
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Email
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Message
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub, i) => (
                    <TableRow
                      key={`${sub.email}-${sub.submittedAt}-${i}`}
                      className="border-border/20 hover:bg-white/3"
                    >
                      <TableCell className="font-medium">{sub.name}</TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${sub.email}`}
                          className="text-primary hover:underline text-sm"
                        >
                          {sub.email}
                        </a>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {sub.message}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(sub.submittedAt)}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Submission
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Delete message from {sub.name}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(i)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
