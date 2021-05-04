import { makeAutoObservable } from "mobx";
import { history } from "../..";
import agent from "../api/agent";
import { User, UserLogin } from "../models/user";
import { store } from "./store";

export default class UserStore {
    user: User | null = null;
    facebookAccessToken: string | null = null;
    facebookLoading = false;
    refreshTokenTimeout: any;

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

    setRefreshTokenTimeout = (refreshTokenTimeout: any) => {
        this.refreshTokenTimeout = refreshTokenTimeout;
    }

    getUser = async () => {
        try {
            const user = await agent.Account.current();
            store.commonStore.setToken(user.token);
            this.setUser(user);
            this.startRefreshTokenTimer(user);
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

    register = async (credentials: UserLogin) => {
        try {
            await agent.Account.register(credentials);
            history.push(`/account/registerSuccess?email=${credentials.email}`);
            store.modalStore.close();
        } catch (error) {
            throw error;
        }
    }

    login = async (creds: UserLogin) => {
        try {
            const user = await agent.Account.login(creds);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
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
                this.startRefreshTokenTimer(user);
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

    refreshToken = async () => {
        this.stopRefreshTokenTimer();

        try {
            const user = await agent.Account.refreshToken();
            this.setUser(user);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
        } catch (error) {
            console.log(error);
        }
    }

    logout = () => {
        store.commonStore.setToken(null);
        window.localStorage.removeItem('jwt');
        this.user = null;
        history.push('/');
    }

    private startRefreshTokenTimer(user: User) {
        const jwtToken = JSON.parse(atob(user.token.split('.')[1]));
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);

        this.setRefreshTokenTimeout(setTimeout(this.refreshToken, timeout));
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }
}