import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: 'src/app/pages/home/home.module#HomePageModule' },
  { path: 'skeleton', loadChildren: 'src/app/pages/skeleton/skeleton.module#SkeletonPageModule' },
  { path: 'videos', loadChildren: 'src/app/pages/videos/videos.module#VideosPageModule' },
  { path: 'detail', loadChildren: './pages/detail/detail.module#DetailPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
