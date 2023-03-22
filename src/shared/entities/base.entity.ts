import { Types } from 'mongoose';

export abstract class BaseEntity {
    readonly _id: Types.ObjectId;
    readonly id: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
