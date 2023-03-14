import { resolve } from 'path';

export function getEnvFilePath(): [string, string] {
  const envsFolder = resolve(__dirname, '../../common/envs');
  const currentEnv = process.env.NODE_ENV || 'development';
  const envFileByVar = resolve(envsFolder, `.env.${currentEnv}`);
  const envFileCommon = resolve(envsFolder, '.env');

  return [envFileByVar, envFileCommon];
}
