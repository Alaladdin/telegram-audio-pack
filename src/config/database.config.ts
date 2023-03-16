import { ConfigService } from '@nestjs/config';
import { TypegooseModuleOptions } from 'nestjs-typegoose';

const getDatabaseOptions = (): Omit<TypegooseModuleOptions, 'uri'> => ({
    useNewUrlParser: true,
    useUnifiedTopology: true,
    promoteBuffers: true,
});

export const getDatabaseConfig = (configService: ConfigService): TypegooseModuleOptions => ({
    uri: configService.get('DB_URI') || '',
    ...getDatabaseOptions(),
});
