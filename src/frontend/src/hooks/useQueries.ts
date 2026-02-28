import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AboutMe,
  ContactFormSubmission,
  ContactInfo,
  NewVideoInput,
  Photo,
  Video,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Videos ─────────────────────────────────────────────────────────────────

export function useGetVideos() {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewVideoInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addVideo(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useUpdateVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: NewVideoInput }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateVideo(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useDeleteVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteVideo(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

// ─── Photos ──────────────────────────────────────────────────────────────────

export function useGetPhotos() {
  const { actor, isFetching } = useActor();
  return useQuery<Photo[]>({
    queryKey: ["photos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPhotos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      blobId,
      title,
    }: { blobId: string; title: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addPhoto(blobId, title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}

export function useDeletePhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deletePhoto(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}

// ─── About ───────────────────────────────────────────────────────────────────

export function useGetAboutMe() {
  const { actor, isFetching } = useActor();
  return useQuery<AboutMe>({
    queryKey: ["aboutMe"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAboutMe();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateAboutMe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bio,
      profilePhotoBlobId,
      isVisible,
    }: {
      bio: string;
      profilePhotoBlobId: string | null;
      isVisible: boolean;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateAboutMe(bio, profilePhotoBlobId, isVisible);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aboutMe"] });
    },
  });
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export function useGetContactInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<ContactInfo>({
    queryKey: ["contactInfo"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getContactInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateContactInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      instagram,
      email,
      phone,
    }: {
      instagram: string;
      email: string;
      phone: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateContactInfo(instagram, email, phone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactInfo"] });
    },
  });
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

export function useSubmitContactForm() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      email,
      message,
    }: {
      name: string;
      email: string;
      message: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitContactForm(name, email, message);
    },
  });
}

export function useGetContactFormSubmissions() {
  const { actor, isFetching } = useActor();
  return useQuery<ContactFormSubmission[]>({
    queryKey: ["contactFormSubmissions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getContactFormSubmissions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeleteContactFormSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (index: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteContactFormSubmission(index);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactFormSubmissions"] });
    },
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
