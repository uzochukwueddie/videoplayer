import { Platform, AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { VideoService } from 'src/app/services/video.service';
import { DetailPage } from 'src/app/pages/detail/detail.page';

@Component({
  selector: 'app-videos',
  templateUrl: './videos.page.html',
  styleUrls: ['./videos.page.scss'],
})
export class VideosPage implements OnInit {
  path: string;
  folderName: any;
  videos = [];
  showDeleteIcons = false;
  videoname: string;
  videoObject = {};
  deleted = false;

  constructor(
    private videoService: VideoService,
    private platform: Platform,
    private route: ActivatedRoute,
    private streamingMedia: StreamingMedia,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    this.route.queryParamMap
      .subscribe((data: Params) => {
        this.path = data.params.folder;
        const name = this.path.split('/').slice(1);
        this.folderName = name[name.length - 1];
      });
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.getAllVideos();
    });
  }

  getAllVideos() {
    this.videoService.videosInDir(this.path)
      .then(async (data: any) => {
        this.videos = data;
        if (this.deleted) {
          await this.loadingCtrl.dismiss();
          this.showToast();
        }
      }, err => console.log(err));
  }

  playVideo(videoPath) {
    const options: StreamingVideoOptions = {
      successCallback: () => { console.log('Video played'); },
      errorCallback: (e) => { console.log(e); },
      orientation: 'portrait',
      shouldAutoClose: true,
      controls: true
    };
    this.streamingMedia.playVideo(videoPath, options);
  }

  displayDeleteIcons(event, video) {
    if (event.type === 'press') {
      this.showDeleteIcons = true;
      this.videoname = video.name;
      this.videoObject = video;
    }
  }

  unCheck() {
    this.showDeleteIcons = false;
    this.videoname = undefined;
  }

  duration(duration: number) {
    return this.videoService.formatDuration(duration);
  }

  deleteVideo(video) {
    this.deleteVideoAlert(video);
  }

  deselectVideo() {
    this.showDeleteIcons = false;
    // this.videoname = undefined;
  }

  async deleteVideoAlert(video) {
    const alert = await this.alertCtrl.create({
      message: 'Do you want to delete this file?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        },
        {
          text: 'YES',
          handler: async () => {
            this.loader();
            this.showDeleteIcons = false;
            const thumbnailPath = video.thumbnailPath.split('/');
            const thumbnail = thumbnailPath.splice(-1, 1)[0];
            this.videoService.removeVideoFromDir(this.path, video.name, thumbnailPath.join('/'), thumbnail)
              .then((data: any) => {
                this.deleted = data.success;
                this.getAllVideos();
              })
              .catch(err => console.log(err));
          }
        }
      ]
    });
    return await alert.present();
  }

  async loader() {
    const loading = await this.loadingCtrl.create({
      message: 'Deleting...'
    });
    return await loading.present();
  }

  async showToast() {
    const toast = await this.toastCtrl.create({
      message: 'Video deleted',
      duration: 2000
    });
    return await toast.present();
  }

  async videoDetailModal(video) {
    const modal = await this.modalCtrl.create({
      component: DetailPage,
      componentProps: {
        video
      }
    });
    this.showDeleteIcons = false;
    return await modal.present();
  }

}
