import { makeAutoObservable, reaction, runInAction } from "mobx";
import { Activity, ActivityFormValues } from "../models/activity";
import agent from "../api/agent";
import { format } from "date-fns";
import { store } from "./store";
import { Profile } from "../models/profile";
import { Pagination, PagingParams } from "../models/pagination";

export default class ActivityStore {
    activities = new Map<string, Activity>();
    selectedActivity: Activity | undefined = undefined;
    loading = false;
    loadingInitial = false;
    pagination: Pagination | null = null;
    pagingParams = new PagingParams();
    predicate = new Map().set('all', true);

    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.predicate.keys(),
            () => {
                this.pagingParams = new PagingParams();
                this.activities.clear();
                this.list();
            }
        )
    }

    setActivity = (activity: Activity) => {
        const user = store.userStore.user;
        if (user) {
            activity.isGoing = activity.attendees!.some(
                attendee => attendee.username === user.username
            )
            activity.isHost = activity.hostUsername === user.username;
            activity.host = activity.attendees?.find(attendee => attendee.username === activity.hostUsername)
        }

        activity.date = new Date(activity.date!)
        this.activities.set(activity.id, activity);
    }

    deleteActivity = (id: string) => {
        this.activities.delete(id);
    }

    setSelectedActivity = (activity: Activity | undefined) => {
        this.selectedActivity = activity;
    }

    setSelectedActivityAttendees = (attendees: Profile[]) => {
        this.selectedActivity!.attendees = attendees;
    }

    setSelectedActivityIsGoing = (isGoing: boolean) => {
        this.selectedActivity!.isGoing = isGoing;
    }

    setSelectedActivityIsCancelled = (isCancelled: boolean) => {
        this.selectedActivity!.isCancelled = isCancelled;
    }

    setLoading = (state: boolean) => {
        this.loading = state;
    }

    setLoadingInitial = (state: boolean) => {
        this.loadingInitial = state;
    }

    setPagination = (pagination: Pagination) => {
        this.pagination = pagination;
    }

    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }

    setPredicate = (predicate: string, value: string | Date) => {
        const resetPredicate = () => {
            this.predicate.forEach((value, key) => {
                if (key !== 'startDate') this.predicate.delete(key);
            })
        }

        switch (predicate) {
            case 'startDate':
                this.predicate.delete(predicate);
                this.predicate.set(predicate, value);
                break;
            default:
                resetPredicate();
                this.predicate.set(predicate, true);
        }
    }

    get activitiesByDate() {
        return Array.from(this.activities.values())
            .sort((activityA, activityB) => activityA.date!.getTime() - activityB.date!.getTime());
    }

    get groupedActivities() {
        return Object.entries(
            this.activitiesByDate.reduce((activities, activity) => {
                const date = format(activity.date!, 'dd MMM yyyy');//.toISOString().split('T')[0];
                activities[date] = activities[date] ? [...activities[date], activity] : [activity];
                return activities;
            }, {} as {[key: string]: Activity[]})
        )
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append('pageNumber', this.pagingParams.pageNumber.toString());
        params.append('pageSize', this.pagingParams.pageSize.toString());

        this.predicate.forEach((value, key) => {
            if (key === 'startDate') {
                params.append(key, (value as Date).toISOString())
            } else {
                params.append(key, value);
            }
        })

        return params;
    }

    detail = async (id: string) => {
        let activity = this.activities.get(id);

        if (activity) {
            this.setSelectedActivity(activity);
            return activity;
        } else {
            this.setLoadingInitial(true);

            try {
                activity = await agent.Activities.details(id);

                this.setActivity(activity);
                this.setSelectedActivity(activity);
                this.setLoadingInitial(false);
                return activity;
            } catch (error) {
                console.log(error);
            }
        }

        this.setLoadingInitial(false);
    }

    list = async () => {
        this.setLoadingInitial(true);

        try {
            const result = await agent.Activities.list(this.axiosParams);

            result.data.forEach(activity => {
                this.setActivity(activity);
            })

            this.setPagination(result.pagination);
        } catch (error) {
            console.log(error);
        }

        this.setLoadingInitial(false);
    }

    create = async (activity: ActivityFormValues) => {
        const user = store.userStore.user;
        const attendee = new Profile(user!);

        try {
            await agent.Activities.create(activity);
            const newActivity = new Activity(activity);
            newActivity.hostUsername = user!.username;
            newActivity.attendees = [attendee];
            this.setActivity(newActivity);
            this.setSelectedActivity(newActivity);
        } catch (error) {
            console.log(error);
        }
    }

    update = async (activity: ActivityFormValues) => {
        try {
            await agent.Activities.update(activity);

            runInAction(() => {
                if (activity.id) {
                    let updatedActivity = { ...this.detail(activity.id), ...activity }
                    this.activities.set(activity.id, updatedActivity as unknown as Activity);
                    this.setSelectedActivity(updatedActivity as unknown as Activity);
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    attend = async () => {
        this.setLoading(true);
        
        const user = store.userStore.user;
        try {
            await agent.Activities.attend(this.selectedActivity!.id);
            if (this.selectedActivity?.isGoing) {
                this.setSelectedActivityAttendees(this.selectedActivity!.attendees?.filter(a => a.username !== user?.username)!);
                this.setSelectedActivityIsGoing(false);
            } else {
                const attendee = new Profile(user!);
                const attendees = this.selectedActivity?.attendees!;
                attendees.push(attendee);
                this.setSelectedActivityAttendees(attendees);
                this.setSelectedActivityIsGoing(false);
            }

            this.setActivity(this.selectedActivity!);
        } catch (error) {
            console.log(error);
        }

        this.setLoading(false);
    }

    updateAttendeeFollowing = (username: string) => {
        this.activities.forEach(activity => {
            activity.attendees.forEach(attendee => {
                if (attendee.username === username) {
                    attendee.following ? attendee.followersCount-- : attendee.followersCount++
                    attendee.following = !attendee.following;
                }
            })
        });
    }

    cancel = async () => {
        this.loading = true;

        try {
            await agent.Activities.attend(this.selectedActivity!.id);

            this.setSelectedActivityIsCancelled(!this.selectedActivity?.isCancelled);
            this.setActivity(this.selectedActivity!);
        } catch (error) {
            console.log(error);
        }

        this.setLoading(false);
    }

    delete = async (id: string) => {
        this.loading = true;

        try {
            await agent.Activities.delete(id);

            this.deleteActivity(id);
        } catch (error) {
            console.log(error);
        }

        this.setLoading(false);
    }
}