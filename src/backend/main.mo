import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";

import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

// Run migration when upgrade/replacing canister.
(with migration = Migration.run)
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
    category : Text;
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

  public type SiteText = {
    navBrand : Text;
    navHome : Text;
    navWork : Text;
    navAbout : Text;
    navContact : Text;
    heroBadge : Text;
    heroName : Text;
    heroSubtitle : Text;
    heroDescription : Text;
    heroCta1 : Text;
    heroCta2 : Text;
    heroScroll : Text;
    workLabel : Text;
    workHeading : Text;
    workDescription : Text;
    galleryLabel : Text;
    galleryHeading : Text;
    galleryDescription : Text;
    aboutLabel : Text;
    aboutHeading : Text;
    stat1Value : Text;
    stat1Label : Text;
    stat2Value : Text;
    stat2Label : Text;
    stat3Value : Text;
    stat3Label : Text;
    contactLabel : Text;
    contactHeading : Text;
    contactDescription : Text;
    contactGetInTouch : Text;
    contactSendMessage : Text;
    footerName : Text;
  };

  public type ResultItem = {
    id : Nat;
    blobId : Text;
    title : Text;
    category : Text;
    createdAt : Int;
  };

  module Video {
    public func compare(video1 : Video, video2 : Video) : Order.Order {
      Nat.compare(video1.sortOrder, video2.sortOrder);
    };
  };

  let accessControlState = AccessControl.initState();
  let videos = Map.empty<Nat, Video>();
  let photos = Map.empty<Nat, Photo>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let results = Map.empty<Nat, ResultItem>();
  let photoCategories = List.empty<Text>();
  var nextVideoId = 1;
  var nextPhotoId = 1;
  var nextResultId = 1;
  var aboutMe : ?AboutMe = null;
  var contactInfo : ?ContactInfo = null;
  var siteText : ?SiteText = null;
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

  // Video Functions - Public read access for portfolio viewing
  public query func getVideo(id : Nat) : async Video {
    switch (videos.get(id)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) { video };
    };
  };

  public query func getVideos() : async [Video] {
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

  // Photo Functions - Public read access for gallery viewing
  public query func getPhoto(id : Nat) : async Photo {
    switch (photos.get(id)) {
      case (null) { Runtime.trap("Photo not found") };
      case (?photo) { photo };
    };
  };

  public query func getPhotos() : async [Photo] {
    photos.values().toArray();
  };

  public shared ({ caller }) func addPhoto(blobId : Text, title : Text, category : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can add photos");
    };
    let photo : Photo = {
      id = nextPhotoId;
      blobId;
      title;
      category;
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

  // Photo Categories Functions
  public query func getPhotoCategories() : async [Text] {
    photoCategories.toArray();
  };

  public shared ({ caller }) func updatePhotoCategories(newCategories : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update photo categories");
    };
    photoCategories.clear();
    photoCategories.addAll(newCategories.values());
  };

  // Results Functions
  public query func getResults() : async [ResultItem] {
    results.values().toArray();
  };

  public shared ({ caller }) func addResult(blobId : Text, title : Text, category : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can add results");
    };
    let result : ResultItem = {
      id = nextResultId;
      blobId;
      title;
      category;
      createdAt = Time.now();
    };
    results.add(nextResultId, result);
    nextResultId += 1;
  };

  public shared ({ caller }) func deleteResult(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete results");
    };
    if (not results.containsKey(id)) { Runtime.trap("Result not found") };
    results.remove(id);
  };

  // About Me Functions - Public read access when visible
  public query ({ caller }) func getAboutMe() : async AboutMe {
    switch (aboutMe) {
      case (null) { Runtime.trap("About Me not found") };
      case (?about) {
        // Allow public access if visible, admin can always view
        if (not about.isVisible and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("About Me is not visible");
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

  // Contact Info Functions - Public read access for visitors to contact
  public query func getContactInfo() : async ContactInfo {
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

  // Contact Form Functions - Public submission, admin-only viewing
  public shared func submitContactForm(name : Text, email : Text, message : Text) : async () {
    // No authorization check - anyone can submit contact form
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

  // Site Text Functions - Public read access for all visitors
  public query func getSiteText() : async SiteText {
    switch (siteText) {
      case (?text) { text };
      case (null) { getDefaultText() };
    };
  };

  public shared ({ caller }) func updateSiteText(newText : SiteText) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update site text");
    };
    siteText := ?newText;
  };

  func getDefaultText() : SiteText {
    {
      navBrand = "VR1627";
      navHome = "Home";
      navWork = "Work";
      navAbout = "About";
      navContact = "Contact";
      heroBadge = "Videographer";
      heroName = "Victor Roland";
      heroSubtitle = "Federal Real Estate - Digital Marketing";
      heroDescription = "I blend new media storytelling with digital marketing to create emotional real estate content that sells!";
      heroCta1 = "Hire Me";
      heroCta2 = "View Portfolio";
      heroScroll = "Explore my projects";
      workLabel = "My Work";
      workHeading = "Work Portfolio";
      workDescription = "I deliver tailored production packages including shorts, walkthroughs, and tutorials, with the aim to drive measurable business growth for my clients.";
      galleryLabel = "Gallery";
      galleryHeading = "Proud Work";
      galleryDescription = "Take a peek behind the scenes of projects and moments captured on set.";
      aboutLabel = "About Me";
      aboutHeading = "Why work with me?";
      stat1Value = "+10";
      stat1Label = "Clients";
      stat2Value = "+400";
      stat2Label = "Videos";
      stat3Value = "7Y";
      stat3Label = "Experience";
      contactLabel = "Contact";
      contactHeading = "How can I help?";
      contactDescription = "Let's schedule a call and discuss how your business can benefit from video marketing. Prefer email or WhatsApp? No worries - I'm flexible.";
      contactGetInTouch = "Get In Touch";
      contactSendMessage = "Send Message";
      footerName = "Victor Roland";
    };
  };

  // Helper Functions
  func extractYouTubeId(url : Text) : Text {
    url;
  };
};
