import { Types } from 'mongoose';

export abstract class BaseModel {
    _id: Types.ObjectId;
    id: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}
