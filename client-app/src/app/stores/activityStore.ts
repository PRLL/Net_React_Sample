import { makeAutoObservable } from "mobx";
import { Activity } from "../models/activity";
import agent from "../api/agent";

export default class ActivityStore {
    constructor() {
        makeAutoObservable(this)
    }

    activities = new Map<string, Activity>();
    // selectedActivity: Activity | undefined = undefined;
    // editMode = false;
    loading = false;
    loadingInitial = false;

    setActivity = (activity: Activity) => {
        activity.date = activity.date.split('T')[0];
        this.activities.set(activity.id, activity);
    }

    deleteActivity = (id: string) => {
        this.activities.delete(id);
    }

    setLoading = (state: boolean) => {
        this.loading = state;
    }

    setLoadingInitial = (state: boolean) => {
        this.loadingInitial = state;
    }

    get activitiesByDate() {
        return Array.from(this.activities.values()).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    }

    get groupedActivities() {
        return Object.entries(
            this.activitiesByDate.reduce((activities, activity) => {
                const date = activity.date;
                activities[date] = activities[date] ? [...activities[date], activity] : [activity];
                return activities;
            }, {} as {[key: string]: Activity[]})
        )
    }

    // private getActivity = (id: string) => {
    //     return this.activities.get(id);
    // }

    detail = async (id: string) => {
        // let activity = this.getActivity(id);
        let activity = this.activities.get(id);

        if (activity) {
            return activity;
        } else {
            this.setLoadingInitial(true);

            try {
                activity = await agent.Activities.details(id);
                this.setActivity(activity);
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
            const activities = await agent.Activities.list();

            activities.forEach(activity => {
                this.setActivity(activity);
            })
        } catch (error) {
            console.log(error);
        }

        this.setLoadingInitial(false);
    }

    create = async (activity: Activity) => {
        this.loading = true;

        try {
            await agent.Activities.create(activity);

            this.setActivity(activity);
        } catch (error) {
            console.log(error);
        }

        this.setLoading(false);
    }

    update = async (activity: Activity) => {
        this.loading = true;

        try {
            await agent.Activities.update(activity);

            this.setActivity(activity);
            
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