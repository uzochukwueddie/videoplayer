import { Injectable, EventEmitter } from '@angular/core';
import { Platform } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { VideoEditor, CreateThumbnailOptions, GetVideoInfoOptions } from '@ionic-native/video-editor/ngx';
import { DomSanitizer } from '@angular/platform-browser';



@Injectable({
  providedIn: 'root'
})
export class VideoService {
  dirEmitter = new EventEmitter<any[]>();
  dirNamesArray = [];

  constructor(
    private file: File,
    private platform: Platform,
    private videoEditor: VideoEditor,
    private sanitizer: DomSanitizer,
    private webView: WebView
  ) { }

  getVideoDirectories() {
    this.file.resolveLocalFilesystemUrl(this.file.externalRootDirectory)
      .then(async () => {
        const p = await this.file.listDir(this.file.externalRootDirectory, '');
        this.dirEmitter.emit(p);
      });
  }

  async listDirWithVideoFiles(pathName, dirName) {
    if (this.platform.is('android')) {
      const firstFileData = [];
      const secondFileData = [];
      const files = await this.file.listDir(pathName, dirName);
      if (files.length > 0) {
        for (const item of files) {
          const itemName = item.name.endsWith('.mp4') || item.name.endsWith('.3gp') || item.name.endsWith('.avi');
          if (item.isDirectory) {
            const f: any = await this.file.listDir(pathName, item.fullPath.slice(1));
            for (const file of f) {
              const fileName = file.name.endsWith('.mp4') || file.name.endsWith('.3gp') || file.name.endsWith('.avi');
              if (file.isFile && fileName) {
                firstFileData.push(file);
              }
            }
          } else if (item.isFile && itemName) {
            secondFileData.push(item);
          }
        }
        if (firstFileData.length > 0) {
          await this.fileDataArray(firstFileData);
        }
        if (secondFileData.length > 0) {
          await this.fileDataArray(secondFileData);
        }
      }
      if (this.dirNamesArray.length > 0) {
        return this.dirNamesArray;
      }
    }
  }

  async fileDataArray(filesArray) {
    const path = filesArray[0].fullPath.split('/').slice(0, -1);
    const directoryName = path[path.length - 1];
    const option: CreateThumbnailOptions = {
      fileUri: filesArray[0].nativeURL,
      width: 160,
      height: 206,
      outputFileName: filesArray[0].name.split('.')[0],
      quality: 100
    };
    const result = await this.videoEditor.createThumbnail(option);
    this.dirNamesArray.push({
      dirName: directoryName,
      dirContentLength: filesArray.length,
      nativePath: filesArray[0].nativeURL,
      fullPath: filesArray[0].fullPath.split('/').slice(0, -1).join('/'),
      localUrl: this.sanitizer.bypassSecurityTrustResourceUrl(filesArray[0].toInternalURL()),
      thumbnail: this.webView.convertFileSrc(`file://${result}`)
    });
  }

  async videosInDir(dirName) {
    if (this.platform.is('android')) {
      const arr = [];
      const f = await this.file.listDir(this.file.externalRootDirectory, dirName.slice(1));
      for (const item of f) {
        const itemName = item.name.endsWith('.mp4') || item.name.endsWith('.3gp') || item.name.endsWith('.avi');
        if (item.isFile && itemName) {
          const file: any = await this.getFile(item);
          const option: CreateThumbnailOptions = {
            fileUri: item.nativeURL,
            width: 160,
            height: 206,
            outputFileName: file.name.split('.')[0],
            quality: 100
          };
          const result = await this.videoEditor.createThumbnail(option);
          arr.push({
            name: file.name,
            size: this.fileSize(file.size),
            type: file.type,
            modified: new Date(file.lastModifiedDate),
            location: item.nativeURL.replace(/file:\/\//g, ''),
            fullPath: item.nativeURL,
            localUrl: this.sanitizer.bypassSecurityTrustResourceUrl(file.localURL),
            thumbnail: this.webView.convertFileSrc(`file://${result}`),
            thumbnailPath: `file://${result}`,
            videoInfo: await this.getVideoInfoOptions(item.nativeURL)
          });
        }
      }
      return arr;
    }
  }

  async removeVideoFromDir(dirName, fileName, thumbnailPath, thumbnail) {
    if (this.platform.is('android')) {
      const path = `${this.file.externalRootDirectory}${dirName}`;
      await this.file.removeFile(thumbnailPath, thumbnail);
      return await this.file.removeFile(path, fileName);
    }
  }

  async getFile(fileEntry) {
    try {
      return await new Promise((resolve, reject) => fileEntry.file(resolve, reject));
    } catch (err) {
      console.log(err);
    }
  }

  fileSize(size) {
    if (size === 0) {
      return '0 Bytes';
    }
    const k = 1000;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async getVideoInfoOptions(file) {
    const options: GetVideoInfoOptions = {
      fileUri: file
    };
    return await this.videoEditor.getVideoInfo(options);
  }

  formatDuration(inputSeconds: number) {
    const secsNumber = parseInt(inputSeconds.toString(), 10);
    const hours = Math.floor(secsNumber / 3600);
    const minutes = Math.floor((secsNumber - (hours * 3600)) / 60);
    const seconds = secsNumber - (hours * 3600) - (minutes * 60);
    let hoursString = '';
    let minutesString = '';
    let secondsString = '';

    hoursString = (hours < 10) ? `0${hours}` : hours.toString();
    minutesString = (minutes < 10) ? `0${minutes}` : minutes.toString();
    secondsString = (seconds < 10) ? `0${seconds}` : seconds.toString();
    return `${hoursString}:${minutesString}:${secondsString}`;
  }
}
