import axios, { AxiosError, AxiosResponse } from 'axios'
import { toast } from 'react-toastify';
import { history } from '../..';
import { Activity, ActivityFormValues } from '../models/activity';
import { PaginatedResult } from '../models/pagination';
import { Photo, Profile, ProfileActivity } from '../models/profile';
import { User, UserLogin } from '../models/user';
import { store } from '../stores/store';

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

axios.interceptors.request.use(axiosRequestConfig => {
    const token = store.commonStore.token;
    if (token) axiosRequestConfig.headers.Authorization = `Bearer ${token}`;
    return axiosRequestConfig;
})

axios.interceptors.response.use(async response => {
    if (process.env.NODE_ENV === 'development') await sleep(1000);

    const pagination = response.headers['pagination'];
    if (pagination) {
        response.data = new PaginatedResult(response.data, JSON.parse(pagination));
        return response as AxiosResponse<PaginatedResult<any>>;
    } else {
        return response;
    }
}, (error: AxiosError) => {
    const { data, status, config } = error.response!;
    switch (status) {
        case 400:
            if (typeof data === 'string') {
                toast.error(data);
            } else if (config.method === 'get' && data.errors.hasOwnProperty('id')) {
                history.push('not-found');
            }
            else if (data.errors) {
                const modalStateErrors = [];
                for (const key in data.errors) {
                    // if (data.errors[key]) {
                        modalStateErrors.push(data.errors[key])
                    // }
                }

                throw modalStateErrors.flat();
            }

            break;
        case 401:
            toast.error('Unauthorized');
            break;
        case 404:
            history.push('not-found');
            break;
        case 500:
            store.commonStore.setServerError(data);
            history.push('server-error');
            break;
    }
    return Promise.reject(error);
})

const responseBody = <T> (response: AxiosResponse<T>) => response.data;

const requests = {
    get: <T> (url: string) => axios.get<T>(url).then(responseBody),
    post: <T> (url: string, body: {}) => axios.post<T>(url, body).then(responseBody),
    put: <T> (url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
    delete: <T> (url: string) => axios.delete<T>(url).then(responseBody),
}

const Activities = {
    list: (params: URLSearchParams) => axios.get<PaginatedResult<Activity[]>>('activities', { params }).then(responseBody),
    details: (id: string) => requests.get<Activity>(`activities/${id}`),
    create: (activity: ActivityFormValues) => requests.post<void>('activities', activity),
    update: (activity: ActivityFormValues) => requests.put<void>(`activities/${activity.id}`, activity),
    delete: (id: string) => requests.delete<void>(`activities/${id}`),
    attend: (id: string) => requests.post<void>(`activities/${id}/attend`, {})
}

const Account = {
    register: (user: UserLogin) => requests.post<User>('account/register', user),
    login: (user: UserLogin) => requests.post<User>('account/login', user),
    current: () => requests.get<User>('account')
}

const Profiles = {
    details: (username: string) => requests.get<Profile>(`profiles/${username}`),
    listFollowings: (username: string, predicate: string) =>
        requests.get<Profile[]>(`follow/${username}?predicate=${predicate}`),
    listActivities: (username: string, predicate: string) =>
        requests.get<ProfileActivity[]>(`/profiles/${username}/activities?predicate=${predicate}`),
    uploadPhoto: (file: Blob) => {
        let formData = new FormData();
        formData.append('File', file);

        return axios.post<Photo>('photos', formData, {
            headers: { 'Content-type': 'multipart/form-data' }
        })
    },
    setMainPhoto: (id: string) => requests.post(`photos/${id}`, {}),
    update: (profile: Partial<Profile>) => requests.put(`/profiles`, profile), // because only updating 2 properties of 'Profile' use Partial<>
    updateFollowing: (username: string) => requests.post(`follow/${username}`, {}),
    deletePhoto: (id: string) => requests.delete(`photos/${id}`)
}

const agent = {
    Activities,
    Account,
    Profiles
}

export default agent;

const sleep = (delay: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    })
}