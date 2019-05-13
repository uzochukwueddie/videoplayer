import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ToastController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { VideoService } from 'src/app/services/video.service';
import { Subscription } from 'rxjs';

import * as _ from 'lodash';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  videoDirs = [];
  videos = [];
  dirEntries = [];
  isEmpty = true;
  toastMessage: string;
  subscription: Subscription;

  constructor(
    private platform: Platform,
    private videoService: VideoService,
    private file: File,
    private toastController: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.getDirectories();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getDirectories() {
    this.platform.ready().then(async () => {
      this.videoService.getVideoDirectories();
      this.subscription = this.videoService.dirEmitter
        .subscribe(async (data) => {
          if (data.length > 0) {
            await this.getVideoDirEntries(data);
            this.videoDirs = _.uniqBy(this.videos, 'dirName');
            const numberOfDirs = this.videoDirs.length;
            this.toastMessage = numberOfDirs > 1 ? `${numberOfDirs} folders found` :
            (numberOfDirs === 1 ? `${numberOfDirs} folder found` : 'No folder found');
            this.showToast(this.toastMessage);

            if (this.videoDirs.length === 0) {
              setTimeout(() => {
                this.isEmpty = false;
              }, 2000);
            } else {
              this.isEmpty = false;
            }
          }
        }, err => console.log(err));
    });
  }

  reloadPage() {
    this.isEmpty = true;
    this.videos.length = 0;
    if (this.dirEntries.length > 0) {
      this.dirEntries.length = 0;
    }
    this.getDirectories();
  }

  videosPage(folderName) {
    this.router.navigate(['/videos'], {queryParams: { folder: folderName }});
  }

  async getVideoDirEntries(entries) {
    let row;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < entries.length; i++) {
      row = entries[i];
      if (row.isDirectory) {
        this.dirEntries = await this.videoService.listDirWithVideoFiles(this.file.externalRootDirectory, row.fullPath.slice(1));
      }
      if (this.dirEntries && this.dirEntries.length > 0) {
        for (const item of this.dirEntries) {
          this.videos.push(item);
        }
      }
    }
  }

  async showToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    return await toast.present();
  }

}
