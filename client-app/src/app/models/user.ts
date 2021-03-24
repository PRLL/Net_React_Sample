export interface UserLogin {
    email: string;
    password: string;
    displayName?: string;
    username?: string;
}

export interface User {
    username: string;
    displayName: string;
    token: string;
    image?: string;
}