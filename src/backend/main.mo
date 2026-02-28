import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  public type Category = {
    #categoryShorts;
    #categoryLongVideos;
    #categoryClientWork;
  };

  public type Video = {
    id : Nat;
    youtubeId : Text;
    youtubeUrl : Text;
    title : Text;
    description : Text;
    category : Category;
    sortOrder : Nat;
    createdAt : Int;
  };

  public type NewVideoInput = {
    youtubeUrl : Text;
    title : Text;
    description : Text;
    category : Category;
    sortOrder : Nat;
  };

  public type Photo = {
    id : Nat;
    blobId : Text;
    title : Text;
    createdAt : Int;
  };

  public type AboutMe = {
    bio : Text;
    profilePhotoBlobId : ?Text;
    isVisible : Bool;
  };

  public type ContactInfo = {
    instagram : Text;
    email : Text;
    phone : Text;
  };

  public type ContactFormSubmission = {
    name : Text;
    email : Text;
    message : Text;
    submittedAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  module Video {
    public func compare(video1 : Video, video2 : Video) : Order.Order {
      Nat.compare(video1.sortOrder, video2.sortOrder);
    };
  };

  // Components
  let accessControlState = AccessControl.initState();
  let videos = Map.empty<Nat, Video>();
  let photos = Map.empty<Nat, Photo>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextVideoId = 1;
  var nextPhotoId = 1;
  var aboutMe : ?AboutMe = null;
  var contactInfo : ?ContactInfo = null;
  let contactFormSubmissions = List.empty<ContactFormSubmission>();

  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Video Functions
  public query ({ caller }) func getVideo(id : Nat) : async Video {
    switch (videos.get(id)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) { video };
    };
  };

  public query ({ caller }) func getVideos() : async [Video] {
    videos.values().toArray().sort();
  };

  public shared ({ caller }) func addVideo(input : NewVideoInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can add videos");
    };
    let video : Video = {
      id = nextVideoId;
      youtubeId = extractYouTubeId(input.youtubeUrl);
      youtubeUrl = input.youtubeUrl;
      title = input.title;
      description = input.description;
      category = input.category;
      sortOrder = input.sortOrder;
      createdAt = Time.now();
    };
    videos.add(nextVideoId, video);
    nextVideoId += 1;
  };

  public shared ({ caller }) func updateVideo(id : Nat, input : NewVideoInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update videos");
    };
    switch (videos.get(id)) {
      case (null) { Runtime.trap("Video not found") };
      case (?_) {
        let updated : Video = {
          id;
          youtubeId = extractYouTubeId(input.youtubeUrl);
          youtubeUrl = input.youtubeUrl;
          title = input.title;
          description = input.description;
          category = input.category;
          sortOrder = input.sortOrder;
          createdAt = Time.now();
        };
        videos.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteVideo(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete videos");
    };
    if (not videos.containsKey(id)) { Runtime.trap("Video not found") };
    videos.remove(id);
  };

  // Photo Functions
  public query ({ caller }) func getPhoto(id : Nat) : async Photo {
    switch (photos.get(id)) {
      case (null) { Runtime.trap("Photo not found") };
      case (?photo) { photo };
    };
  };

  public query ({ caller }) func getPhotos() : async [Photo] {
    photos.values().toArray();
  };

  public shared ({ caller }) func addPhoto(blobId : Text, title : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can add photos");
    };
    let photo : Photo = {
      id = nextPhotoId;
      blobId;
      title;
      createdAt = Time.now();
    };
    photos.add(nextPhotoId, photo);
    nextPhotoId += 1;
  };

  public shared ({ caller }) func deletePhoto(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete photos");
    };
    if (not photos.containsKey(id)) { Runtime.trap("Photo not found") };
    photos.remove(id);
  };

  // About Me Functions
  public query ({ caller }) func getAboutMe() : async AboutMe {
    switch (aboutMe) {
      case (null) { Runtime.trap("About Me not found") };
      case (?about) {
        // Allow admin to view even when not visible
        if (not about.isVisible and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Not visible");
        };
        about;
      };
    };
  };

  public shared ({ caller }) func updateAboutMe(bio : Text, profilePhotoBlobId : ?Text, isVisible : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update About Me");
    };
    aboutMe := ?{
      bio;
      profilePhotoBlobId;
      isVisible;
    };
  };

  // Contact Info Functions
  public query ({ caller }) func getContactInfo() : async ContactInfo {
    switch (contactInfo) {
      case (null) { Runtime.trap("Contact Info not found") };
      case (?info) { info };
    };
  };

  public shared ({ caller }) func updateContactInfo(instagram : Text, email : Text, phone : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update Contact Info");
    };
    contactInfo := ?{
      instagram;
      email;
      phone;
    };
  };

  // Contact Form Functions
  public shared ({ caller }) func submitContactForm(name : Text, email : Text, message : Text) : async () {
    let submission : ContactFormSubmission = {
      name;
      email;
      message;
      submittedAt = Time.now();
    };
    contactFormSubmissions.add(submission);
  };

  public query ({ caller }) func getContactFormSubmissions() : async [ContactFormSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view submissions");
    };
    contactFormSubmissions.toArray();
  };

  public shared ({ caller }) func deleteContactFormSubmission(index : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete submissions");
    };
    if (index >= contactFormSubmissions.size()) { Runtime.trap("Invalid index") };
    let data = contactFormSubmissions.toArray();
    contactFormSubmissions.clear();
    var i = 0;
    while (i < data.size()) {
      if (i != index) {
        contactFormSubmissions.add(data[i]);
      };
      i += 1;
    };
  };

  // Helper Functions
  func extractYouTubeId(url : Text) : Text {
    url;
  };
};
