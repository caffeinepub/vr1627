import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Video {
    id: bigint;
    title: string;
    sortOrder: bigint;
    createdAt: bigint;
    description: string;
    youtubeId: string;
    category: Category;
    youtubeUrl: string;
}
export interface ContactFormSubmission {
    name: string;
    submittedAt: bigint;
    email: string;
    message: string;
}
export interface NewVideoInput {
    title: string;
    sortOrder: bigint;
    description: string;
    category: Category;
    youtubeUrl: string;
}
export interface AboutMe {
    bio: string;
    isVisible: boolean;
    profilePhotoBlobId?: string;
}
export interface ContactInfo {
    instagram: string;
    email: string;
    phone: string;
}
export interface UserProfile {
    name: string;
}
export interface Photo {
    id: bigint;
    title: string;
    createdAt: bigint;
    blobId: string;
}
export enum Category {
    categoryLongVideos = "categoryLongVideos",
    categoryShorts = "categoryShorts",
    categoryClientWork = "categoryClientWork"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPhoto(blobId: string, title: string): Promise<void>;
    addVideo(input: NewVideoInput): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteContactFormSubmission(index: bigint): Promise<void>;
    deletePhoto(id: bigint): Promise<void>;
    deleteVideo(id: bigint): Promise<void>;
    getAboutMe(): Promise<AboutMe>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactFormSubmissions(): Promise<Array<ContactFormSubmission>>;
    getContactInfo(): Promise<ContactInfo>;
    getPhoto(id: bigint): Promise<Photo>;
    getPhotos(): Promise<Array<Photo>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideo(id: bigint): Promise<Video>;
    getVideos(): Promise<Array<Video>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitContactForm(name: string, email: string, message: string): Promise<void>;
    updateAboutMe(bio: string, profilePhotoBlobId: string | null, isVisible: boolean): Promise<void>;
    updateContactInfo(instagram: string, email: string, phone: string): Promise<void>;
    updateVideo(id: bigint, input: NewVideoInput): Promise<void>;
}
