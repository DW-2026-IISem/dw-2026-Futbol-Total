import { sharedEnvironment } from './environment.shared';

export const environment = {
  production: true,
  ...sharedEnvironment,
};
