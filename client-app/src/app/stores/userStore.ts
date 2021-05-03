import { makeAutoObservable } from "mobx";
import { history } from "../..";
import agent from "../api/agent";
import { User, UserLogin } from "../models/user";
import { store } from "./store";

export default class UserStore {
    user: User | null = null;
    facebookAccessToken: string | null = null;
    facebookLoading = false;

    constructor() {
        makeAutoObservable(this);
    }

    setUser = (user: User) => {
        this.user = user;
    }

    setUserImage = (image: string) => {
        if (this.user) this.user.image = image;
    }

    setDisplayName = (name: string) => {
        if (this.user) this.user.displayName = name;
    }

    setFacebookLoading = (state: boolean) => {
        this.facebookLoading = state;
    }

    getUser = async () => {
        try {
            const user = await agent.Account.current();
            this.setUser(user);
        } catch (error) {
            console.log(error);
        }
    }

    getFacebookLoginStatus = async () => {
        window.FB.getLoginStatus(response => {
            if (response.status === 'connected') {
                this.facebookAccessToken = response.authResponse.accessToken;
            }
        })
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

    facebookLogin = () => {
        this.setFacebookLoading(true);

        const apiLogin = (accessToken: string) => {
            agent.Account.facebookLogin(accessToken).then(user => {
                store.commonStore.setToken(user.token);
                this.setUser(user);
                this.setFacebookLoading(false);
                history.push('/activities');
            }).catch(error => {
                console.log(error);
                this.setFacebookLoading(false);
            })
        }

        if (this.facebookAccessToken) {
            apiLogin(this.facebookAccessToken);
        } else {
            window.FB.login(response => {
                apiLogin(response.authResponse.accessToken);
            }, { scope: 'public_profile,email' })
        }
    }

    logout = () => {
        store.commonStore.setToken(null);
        window.localStorage.removeItem('jwt');
        this.user = null;
        history.push('/');
    }
}