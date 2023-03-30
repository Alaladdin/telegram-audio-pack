import { modelOptions, prop } from '@typegoose/typegoose';
import { getDefaultDatabaseSchemaOptions } from '@/config';
import { BaseEntity } from '@/shared/entities/base.entity';

@modelOptions({
    schemaOptions: {
        collection: 'users',
        ...getDefaultDatabaseSchemaOptions(),
    },
})
export class UserEntity extends BaseEntity {
    @prop({ uniq: true })
    userId: number;

    @prop({ default: null })
    username?: string;

    @prop({ default: null })
    displayName: string;

    @prop({ required: true })
    firstName: string;

    @prop({ default: null })
    lastName?: string;

    @prop({ default: null })
    lang?: string;

    @prop({ required: true })
    isBot: boolean;
}
