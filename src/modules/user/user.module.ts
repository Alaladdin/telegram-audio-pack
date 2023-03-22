import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypegooseModule } from 'nestjs-typegoose';
import { UserEntity } from './entities';

@Module({
    imports: [TypegooseModule.forFeature([{ typegooseClass: UserEntity }])],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
