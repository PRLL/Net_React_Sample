import { /*action, makeObservable, observable, runInAction, */makeAutoObservable } from "mobx";
import { Activity } from "../../models/activity";
import agent from "../api/agent";
import { v4 as uuid } from 'uuid';

export default class ActivityStore {
    // title = 'Hello from MobX!';

    // activities: Activity[] = [];
    activities = new Map<string, Activity>();
    selectedActivity: Activity | undefined = undefined;
    editMode = false;
    loading = false;
    loadingInitial = true;

    constructor() {
        // makeObservable(this, {
        //     title: observable,
        //     setTitle: action//.bound [use '.bound' if not using ' = () => ' on function declaration of setTitle()'
        // })

        makeAutoObservable(this)
    }

    get activitiesByDate() {
        return Array.from(this.activities.values()).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    }

    // setTitle() {
    //     this.title = this.title + '!';
    // }

    // setTitle = () => {
    //     this.title = this.title + '!';
    // }

    load = async () => {
        try {
            const activities = await agent.Activities.list();
            // runInAction(() => { [when didn't use 'setLoadingInitial' error would appear because cannot modify observable values withouth using an action]
                activities.forEach(activity => {
                    activity.date = activity.date.split('T')[0];
                    this.activities.set(activity.id, activity);
                    // this.activities.push(activity);
                })
            // })
        } catch (error) {
            console.log(error);
        }

        this.setLoadingInitial(false);
    }

    setLoadingInitial = (state: boolean) => {
        this.loadingInitial = state;
    }

    select = (id: string) => {
        // this.selectedActivity = this.activities.find(activity => activity.id === id);
        this.selectedActivity = this.activities.get(id);
    }

    deselect = () => {
        this.selectedActivity = undefined;
    }

    openForm = (id?: string) => {
        id ? this.select(id) : this.deselect();
        this.editMode = true;
    }

    closeForm = () => {
        this.editMode = false;
    }

    create = async (activity: Activity) => {
        this.loading = true;
        activity.id = uuid();

        try {
            await agent.Activities.create(activity);

                // this.activities.push(activity);
                this.activities.set(activity.id, activity);
                this.selectedActivity = activity;
                this.editMode = false;
            
        } catch (error) {
            console.log(error);
        }

        this.loading = false;
    }

    update = async (activity: Activity) => {
        this.loading = true;

        try {
            await agent.Activities.update(activity);

                // this.activities = [...this.activities.filter(filteredActivity => filteredActivity.id !== activity.id), activity];
                this.activities.set(activity.id, activity);
                this.selectedActivity = activity;
                this.editMode = false;
            
        } catch (error) {
            console.log(error);
        }

        this.loading = false;
    }

    delete = async (id: string) => {
        this.loading = true;

        try {
            await agent.Activities.delete(id);

                // this.activities = [...this.activities.filter(activity => activity.id !== id)];
                this.activities.delete(id);
                if (this.selectedActivity?.id === id) this.deselect();

        } catch (error) {
            console.log(error);
        }

        this.loading = false;
    }
}