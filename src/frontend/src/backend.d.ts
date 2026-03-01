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
export interface UserProfile {
    name: string;
}
export interface NewVideoInput {
    title: string;
    sortOrder: bigint;
    description: string;
    category: Category;
    youtubeUrl: string;
}
export interface ContactFormSubmission {
    name: string;
    submittedAt: bigint;
    email: string;
    message: string;
}
export interface AboutMe {
    bio: string;
    isVisible: boolean;
    profilePhotoBlobId?: string;
}
export interface SiteText {
    stat1Label: string;
    galleryDescription: string;
    aboutHeading: string;
    heroDescription: string;
    workLabel: string;
    navAbout: string;
    stat2Value: string;
    heroCta1: string;
    heroCta2: string;
    workHeading: string;
    heroScroll: string;
    heroName: string;
    heroBadge: string;
    heroSubtitle: string;
    contactGetInTouch: string;
    workDescription: string;
    stat2Label: string;
    contactSendMessage: string;
    stat3Value: string;
    contactLabel: string;
    contactHeading: string;
    navHome: string;
    contactDescription: string;
    aboutLabel: string;
    navBrand: string;
    navContact: string;
    navWork: string;
    stat1Value: string;
    galleryLabel: string;
    stat3Label: string;
    galleryHeading: string;
    footerName: string;
}
export interface ResultItem {
    id: bigint;
    title: string;
    createdAt: bigint;
    blobId: string;
    category: string;
}
export interface ContactInfo {
    instagram: string;
    email: string;
    phone: string;
}
export interface Photo {
    id: bigint;
    title: string;
    createdAt: bigint;
    blobId: string;
    category: string;
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
    addPhoto(blobId: string, title: string, category: string): Promise<void>;
    addResult(blobId: string, title: string, category: string): Promise<void>;
    addVideo(input: NewVideoInput): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteContactFormSubmission(index: bigint): Promise<void>;
    deletePhoto(id: bigint): Promise<void>;
    deleteResult(id: bigint): Promise<void>;
    deleteVideo(id: bigint): Promise<void>;
    getAboutMe(): Promise<AboutMe>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactFormSubmissions(): Promise<Array<ContactFormSubmission>>;
    getContactInfo(): Promise<ContactInfo>;
    getPhoto(id: bigint): Promise<Photo>;
    getPhotoCategories(): Promise<Array<string>>;
    getPhotos(): Promise<Array<Photo>>;
    getResults(): Promise<Array<ResultItem>>;
    getSiteText(): Promise<SiteText>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideo(id: bigint): Promise<Video>;
    getVideos(): Promise<Array<Video>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitContactForm(name: string, email: string, message: string): Promise<void>;
    updateAboutMe(bio: string, profilePhotoBlobId: string | null, isVisible: boolean): Promise<void>;
    updateContactInfo(instagram: string, email: string, phone: string): Promise<void>;
    updatePhotoCategories(newCategories: Array<string>): Promise<void>;
    updateSiteText(newText: SiteText): Promise<void>;
    updateVideo(id: bigint, input: NewVideoInput): Promise<void>;
}
