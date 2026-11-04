import { sharedEnvironment } from './environment.shared';

export const environment = {
  production: false,
  ...sharedEnvironment,
};
