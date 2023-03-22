import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { UserEntity } from './entities';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { SetUserDto } from './dto';

@Injectable()
export class UserService {
    constructor(@InjectModel(UserEntity) private readonly userRepository: ModelType<UserEntity>) {}

    async createOrUpdateUser(user: SetUserDto) {
        const filter = { userId: user.userId };
        const options = { upsert: true, new: true, lean: true };

        return this.userRepository.findOneAndUpdate(filter, user, options);
    }

    async getUser(userId: UserEntity['userId']) {
        return this.userRepository.findOne({ userId }).lean();
    }
}
