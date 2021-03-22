import { makeAutoObservable } from "mobx";
import { Activity } from "../models/activity";
import agent from "../api/agent";
import { format } from "date-fns";

export default class ActivityStore {
    constructor() {
        makeAutoObservable(this)
    }

    activities = new Map<string, Activity>();
    loading = false;
    loadingInitial = false;

    setActivity = (activity: Activity) => {
        activity.date = new Date(activity.date!)
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
        return Array.from(this.activities.values()).sort((activityA, activityB) => activityA.date!.getTime() - activityB.date!.getTime());
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

    detail = async (id: string) => {
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