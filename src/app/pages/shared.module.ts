import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonPage } from './skeleton/skeleton.page';
import { DetailPage } from 'src/app/pages/detail/detail.page';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [SkeletonPage, DetailPage],
  exports: [SkeletonPage, DetailPage],
  entryComponents: [SkeletonPage, DetailPage],
  imports: [
    CommonModule,
    IonicModule.forRoot()
  ]
})
export class SharedModule { }
