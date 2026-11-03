import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell/shell').then((module) => module.Shell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/home/home-page/home-page').then(
            (module) => module.HomePage,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
