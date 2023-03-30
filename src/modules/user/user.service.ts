import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { UserEntity } from './entities';
import { ReturnModelType } from '@typegoose/typegoose/lib/types';
import { SetUserDto } from './dto';
import { UserModel } from './user.model';

@Injectable()
export class UserService {
    constructor(@InjectModel(UserEntity) private readonly userRepository: ReturnModelType<typeof UserEntity>) {}

    async createOrUpdateUser(user: SetUserDto): Promise<UserModel> {
        const filter = { userId: user.userId };
        const options = { upsert: true, new: true };

        return this.userRepository.findOneAndUpdate(filter, user, options).lean();
    }

    async getUser(userId: UserEntity['userId']): Promise<UserModel> {
        return this.userRepository.findOne({ userId }).lean();
    }
}
