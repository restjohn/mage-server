import { User } from "core-lib-src/user";

export type LoginPage = {
    logins: Login[],
    next: string,
    prev: string,
};

export type Login = {
    device: Device,
    id: string,
    timestamp: Date,
    user: User,
};

export type Device = {
    appVersion: string,
    id: string,
    registered: boolean,
    uid: number | string,
    userAgent: string,
    userId: string,
}