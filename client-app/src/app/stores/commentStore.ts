import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { makeAutoObservable } from "mobx";
import { ActivityComment } from "../models/comment";
import { store } from "./store";

export default class CommentStore {
    hubConnection: HubConnection | null = null;
    activityComments: ActivityComment[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    setHubConnection = (hubConnection: HubConnection) => {
        this.hubConnection = hubConnection;
    }

    setActivityComments = (activityComments: ActivityComment[]) => {
        activityComments.forEach(activityComment => {
            activityComment.createdAt = new Date(activityComment.createdAt + 'Z');
        })

        this.activityComments = activityComments;
    }

    unshiftActivityComments = (activityComment: ActivityComment) => {
        activityComment.createdAt = new Date(activityComment.createdAt);
        this.activityComments.unshift(activityComment);
    }

    createHubConnection = (activityId: string) => {
        if (store.activityStore.selectedActivity) {
            this.hubConnection = new HubConnectionBuilder().withUrl(process.env.REACT_APP_CHAT_URL + '?activityId=' + activityId, {
                accessTokenFactory: () => store.userStore.user?.token!
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

            this.hubConnection.start().catch(error => console.log('Error establishing connection to comments...', error))

            this.hubConnection.on('LoadComments', (activityComments: ActivityComment[]) => {
                this.setActivityComments(activityComments);
            })

            this.hubConnection.on('ReceiveComment', (activityComment: ActivityComment) => {
                this.unshiftActivityComments(activityComment);
            })
        }
    }

    stopHubConnection = () => {
        this.hubConnection?.stop().catch(error => console.log('Error trying to stop comment connection...', error));
    }

    clearComments = () => {
        this.setActivityComments([]);
        this.stopHubConnection();
    }

    addComment = async (values: any) => {
        values.activityId = store.activityStore.selectedActivity?.id;

        try{
            await this.hubConnection?.invoke('SendComment', values);
        } catch (error) {
            console.log(error);
        }
    }
}