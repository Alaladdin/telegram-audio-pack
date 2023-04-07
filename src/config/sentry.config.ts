import { SentryModuleOptions } from '@ntegral/nestjs-sentry';
import { ConfigService } from '@nestjs/config';

export const getSentryConfig = (configService: ConfigService): SentryModuleOptions => {
    const environment = configService.get('NODE_ENV');

    return {
        dsn: configService.get('SENTRY_DSN'),
        enabled: environment === 'production',
        debug: environment !== 'production',
        environment: environment,
        logLevels: ['debug'],
        tracesSampleRate: 1.0,
        release: configService.get('npm_package_version'),
        beforeSend: (e) => {
            delete e.contexts?.os;
            delete e.contexts?.device;

            return e;
        },
        beforeSendTransaction: (e) => {
            // @ts-ignore
            e.user = e.contexts?.trace?.data?.user;
            delete e.contexts?.os;
            delete e.contexts?.device;

            return e;
        },
    };
};
