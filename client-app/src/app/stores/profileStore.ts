import { makeAutoObservable } from "mobx";
import agent from "../api/agent";
import { Photo, Profile } from "../models/profiles"
import { store } from "./store";

export default class ProfileStore {
    profile: Profile | null = null;
    loading = false;
    mainLoading = false;
    uploading = false;

    constructor() {
        makeAutoObservable(this);
    }

    setProfile = (profile: Profile) => {
        this.profile = profile;
    }

    filterProfilePhoto = (photoId: string) => {
        if (this.profile) {
            this.profile.photos = this.profile.photos?.filter(p => p.id !== photoId);
        }
    }

    pushProfilePhoto = (photo: Photo) => {
        this.profile?.photos?.push(photo);
    }

    setProfileMainPhoto = (photo: Photo) => {
        if (this.profile && this.profile.photos) {
            this.profile.photos.find(photo => photo.isMain)!.isMain = false;
            this.profile.photos.find(iPhoto => iPhoto.id === photo.id)!.isMain = true;
            this.profile.image = photo.url;
        }
    }

    setLoading = (state: boolean) => {
        this.loading = state;
    }

    setMainLoading = (state: boolean) => {
        this.mainLoading = state;
    }

    setUploading = (state: boolean) => {
        this.uploading = state;
    }

    // this is called computed property
    get isProfileFromCurrentUser() {
        return store.userStore.user && this.profile
            ? store.userStore.user.username === this.profile.username
            : false;
    }

    load = async (username: string) => {
        this.setLoading(true);

        try {
            this.setProfile(await agent.Profiles.get(username));
        } catch (error) {
            console.log(error);
        }

        this.setLoading(false);
    }

    uploadPhoto = async (file: Blob) => {
        this.setUploading(true);

        try {
            const response = await agent.Profiles.uploadPhoto(file);
            const photo = response.data;

            if (this.profile) {
                this.pushProfilePhoto(photo);

                if (photo.isMain && store.userStore.user) {
                    store.userStore.setUserImage(photo.url);
                    this.profile.image = photo.url;
                }
            }
        } catch (error) {
            console.log(error);
        }

        this.setUploading(false);
    }

    setMainPhoto = async (photo: Photo) => {
        this.setMainLoading(true);

        try {
            await agent.Profiles.setMainPhoto(photo.id);

            store.userStore.setUserImage(photo.url);

            if (this.profile && this.profile.photos) {
                this.setProfileMainPhoto(photo);
            }
        } catch (error) {
            console.log(error);
        }

        this.setMainLoading(false);
    }

    update = async (profile: Partial<Profile>) => {
        this.setMainLoading(true);

        try {
            await agent.Profiles.update(profile);

            if (profile.displayName && profile.displayName !== store.userStore.user?.displayName) {
                store.userStore.setDisplayName(profile.displayName);
            }

            this.setProfile({ ...this.profile, ...profile as Profile });
        } catch (error) {
            console.log(error);
        }

        this.setMainLoading(false);
    }

    deletePhoto = async (photo: Photo) => {
        this.setMainLoading(true);

        try {
            await agent.Profiles.deletePhoto(photo.id);

            this.filterProfilePhoto(photo.id);
        } catch (error) {
            console.log(error);
        }

        this.setMainLoading(false);
    }
}