import { ObjectId } from 'mongodb';

export interface Team {
    id: ObjectId;
    name: string;
    description: string;
    teamEventId: number;
    userIds: ObjectId[];
    acl: Records<ObjectId, string>;
    permissions: string[];
}