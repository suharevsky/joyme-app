import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {canActivate, redirectLoggedInTo, redirectUnauthorizedTo} from '@angular/fire/auth-guard';

// Send unauthorized  users to login
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/landing']);
// Automatically log in users
const redirectLoggedInToResults = () => redirectLoggedInTo(['/tabs/highlights']);

const routes: Routes = [
    /*{
      path: 'passions',
      loadChildren: './pages/passions/passions.module#PassionsPageModule'
    },*/
    {
        path: '',
        redirectTo: 'landing',
        pathMatch: 'full'
    },
    {
        path: 'landing',
        // loadChildren: './pages/landing/landing.module#LandingPageModule',
        loadChildren: () =>
            import('./pages/landing/landing.module').then(
                (m) => m.LandingPageModule
            ),
        ...canActivate(redirectLoggedInToResults),
    },
    {
        path: 'register-steps',
        loadChildren: () =>
            import('./pages/register-steps/register-steps.module').then(
                (m) => m.RegisterStepsPageModule
            ),
    },
    {
        path: 'chat',
        loadChildren: () => import('./pages/chat/chat.module').then(m => m.ChatPageModule)
    },
    {
        path: 'profile',
        loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule)

    },
    {
        path: 'tabs',
        loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
    },
    {
        path: 'likes',
        loadChildren: () => import('./pages/likes/likes.module').then(m => m.LikesPageModule)
    },
    {
        path: 'report',
        loadChildren: () => import('./pages/report/report.module').then(m => m.ReportPageModule)
    },
    {
        path: 'filter',
        loadChildren: () => import('./pages/filter/filter.module').then(m => m.FilterPageModule)
    },
    {
        path: 'list-options',
        loadChildren: () => import('./pages/list-options/list-options.module').then(m => m.ListOptionsPageModule)
    },
    {
        path: 'photos',
        loadChildren: () => import('./pages/photos/photos.module').then(m => m.PhotosPageModule)
    },
    {
        path: 'page/:slug',
        loadChildren: () => import('./pages/page/page.module').then(m => m.PagePageModule)
    },
  {
    path: 'image-modal',
    loadChildren: () => import('./components/image-modal/image-modal.module').then( m => m.ImageModalPageModule)
  },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
