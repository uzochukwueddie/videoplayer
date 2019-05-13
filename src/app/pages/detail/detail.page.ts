import { ModalController, NavParams } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { VideoService } from 'src/app/services/video.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {
  videoDetail: any;

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private videoService: VideoService
  ) { }

  ngOnInit() {
    this.videoDetail = this.navParams.data.video;
  }

  duration(duration: number) {
    return this.videoService.formatDuration(duration);
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
