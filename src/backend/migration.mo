import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";

module {
  // Original types from the legacy actor
  type OldPhoto = {
    id : Nat;
    blobId : Text;
    title : Text;
    createdAt : Int;
  };

  type OldActor = {
    photos : Map.Map<Nat, OldPhoto>;
    nextPhotoId : Nat;
  };

  // Extended new photo type with an optional category
  type NewPhoto = {
    id : Nat;
    blobId : Text;
    title : Text;
    category : Text;
    createdAt : Int;
  };

  // New actor type with photo categories field
  type NewActor = {
    photos : Map.Map<Nat, NewPhoto>;
    photoCategories : List.List<Text>;
    nextPhotoId : Nat;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    let newPhotos = old.photos.map<Nat, OldPhoto, NewPhoto>(
      func(_id, oldPhoto) {
        {
          oldPhoto with category = "Uncategorized";
        };
      }
    );

    let photoCategories = List.empty<Text>();
    photoCategories.add("Uncategorized");

    {
      photos = newPhotos;
      photoCategories;
      nextPhotoId = old.nextPhotoId;
    };
  };
};
