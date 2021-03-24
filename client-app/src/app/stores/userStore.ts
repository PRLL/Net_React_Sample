import { makeAutoObservable } from "mobx";
import { history } from "../..";
import agent from "../api/agent";
import { User, UserLogin } from "../models/user";
import { store } from "./store";

export default class UserStore {
    user: User | null = null;

    constructor() {
        makeAutoObservable(this)
    }

    setUser = (user: User) => {
        this.user = user;
    }

    getUser = async () => {
        try {
            const user = await agent.Account.current();
            this.setUser(user);
        } catch (error) {
            console.log(error);
        }
    }

    get isLoggedIn() {
        return !!this.user;
    }

    register = async (creds: UserLogin) => {
        try {
            const user = await agent.Account.register(creds);
            store.commonStore.setToken(user.token);
            this.setUser(user);
            history.push('/activities');
            store.modalStore.close();
        } catch (error) {
            throw error;
        }
    }

    login = async (creds: UserLogin) => {
        try {
            const user = await agent.Account.login(creds);
            store.commonStore.setToken(user.token);
            this.setUser(user);
            history.push('/activities');
            store.modalStore.close();
        } catch (error) {
            throw error;
        }
    }

    logout = () => {
        store.commonStore.setToken(null);
        window.localStorage.removeItem('jwt');
        this.user = null;
        history.push('/');
    }
}