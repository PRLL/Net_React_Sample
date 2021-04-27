import { makeAutoObservable, reaction } from "mobx";
import agent from "../api/agent";
import { Photo, Profile, ProfileActivity } from "../models/profile"
import { store } from "./store";

export default class ProfileStore {
    profile: Profile | null = null;
    loading = false;
    mainLoading = false;
    followingsLoading = false;
    uploading = false;
    followings: Profile[] = [];
    activeTab = 0;;
    profileActivities: ProfileActivity[] = [];
    loadingActivities = false;

    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.activeTab,
            activeTab => {
                switch (activeTab) {
                    case 3:
                        this.loadFollowings('followers');
                        break;
                    case 4:
                        this.loadFollowings('following');
                        break;
                    default:
                        this.followings = [];
                }
            }
        )
    }

    setProfile = (profile: Profile) => {
        this.profile = profile;
    }

    setProfileFollowersCount = (count: number) => {
        this.profile!.followersCount = count;
    }

    setProfileFollowingCount = (count: number) => {
        this.profile!.followingCount = count;
    }

    filterProfilePhoto = (photoId: string) => {
        if (this.profile) {
            this.profile.photos = this.profile.photos?.filter(p => p.id !== photoId);
        }
    }

    setProfileFollowing = (state: boolean) => {
        this.profile!.following = state;
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

    setFollowingsLoading = (state: boolean) => {
        this.followingsLoading = state;
    }

    setUploading = (state: boolean) => {
        this.uploading = state;
    }

    setFollowings = (profiles: Profile[]) => {
        this.followings = profiles;
    }

    setActiveTab = (activeTab: any) => {
        this.activeTab = activeTab;
    }

    setProfileActivities = (profileActivities: ProfileActivity[]) => {
        this.profileActivities = profileActivities;
    }

    setLoadingActivities = (state: boolean) => {
        this.loadingActivities = state;
    }

    handleFollowingChange = (username: string) => {
        this.followings.forEach(profile => {
            if (profile.username === username) {
                profile.following ? profile.followersCount-- : profile.followersCount++;
                profile.following = !profile.following;
            }
        })
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
            this.setProfile(await agent.Profiles.details(username));
        } catch (error) {
            console.log(error);
        }

        this.setLoading(false);
    }

    loadFollowings = async (predicate: string) => {
        this.setFollowingsLoading(true);

        try {
            const followings = await agent.Profiles.listFollowings(this.profile!.username, predicate);
            this.setFollowings(followings);
        } catch (error) {
            console.log(error);
        }

        this.setFollowingsLoading(false);
    }
    
    loadProfileActivities = async (username: string, predicate?: string) => {
        this.setLoadingActivities(true);

        try {
            this.setProfileActivities(await agent.Profiles.listActivities(username, predicate!));
        } catch (error) {
            console.log(error);
        }

        this.setLoadingActivities(false);
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

    updateFollowing = async (username: string, following: boolean) => {
        this.setMainLoading(true);

        try {
            await agent.Profiles.updateFollowing(username);

            store.activityStore.updateAttendeeFollowing(username);

            if (this.profile) {
                if (this.profile.username === store.userStore.user?.username) {
                    this.setProfileFollowingCount(
                        following
                            ? this.profile.followingCount + 1
                            : this.profile.followingCount - 1);
                } else if (this.profile.username === username) {
                    this.setProfileFollowersCount(
                        following
                            ? this.profile.followersCount + 1
                            : this.profile.followersCount - 1);
                    this.setProfileFollowing(!this.profile.following);
                }
            }

            this.handleFollowingChange(username);
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