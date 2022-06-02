import { Component, OnInit } from '@angular/core';
import { WordsService } from '../words.service';
import { Word } from '../interfaces/Word';
import { Storage } from '@ionic/storage';
// import { fstat } from 'fs';
import * as $ from 'jquery';
import { gsap, TimelineLite, TimelineMax, TweenMax, Back, Power1 } from 'gsap';
import { AppRate } from '@ionic-native/app-rate/ngx';
import { SoundService } from '../sound.service';
import { UserService } from '../user.service';
import { JaraService } from '../jara.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Location } from '@angular/common';

import { BackgroundMode } from '@ionic-native/background-mode/ngx/';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.scss'],
})
export class ContactusComponent implements OnInit {

  multiArray: any[] = [];
  words: any;

  totalRanks: number;
  levelWords: any[];
  levelLength: number;
  levelMarker: number = 0;
  rank: number = 1;
  rankData: any;
  level: number;
  totalLevels: number;


  payload: Word = { word: '', meaning: '' };
  currentWordSplit: string[];

  countLetterScore: number;

  lastLetterInt: number;

  compact: any[] = [];
  compactShuffled: any[] = [];


  selectedLetters: any[] = [];

  sticker: string;
  check: string = "Athans";

  rowToBounce: number = 0;

  jaraWords: any;

  jaraPlayed: any[];

  jaraPercent: string;

  jaraFull: number;

  jaraKomkom: number;


  // profile variables

  cowries: number;
  userid: string;

  videoclicks: number;


  settingsVisible: boolean = false;

  toastMessage: string = "";

  soundStat: boolean = true;
  sfxStat: boolean = true;

  jujuCount: number;
  girraffesCount: number;
  begibegiCount: number;

  isLoggedIn = false;
  isBubble = 0;
  
  sabinusId:any;

  rankName = ["Johny Just Come", "I DEY COUNT BRIDGE", "SMALLIE", "JUNIOR SABINUS"]
  rankDef: any;

  constructor(
    private wordsService: WordsService,
    private storage: Storage,
    private appRate: AppRate,
    private soundService: SoundService,
    private jaraService: JaraService,
    private userService: UserService,
    private backgroundMode: BackgroundMode,
    private router: Router,
    private iab: InAppBrowser,
    private toastController: ToastController,
    private _location: Location
  ) { }

  async ngOnInit() {

    this.soundStat = this.soundService.getSoundStat();
    this.sfxStat = this.soundService.getSfxStat();

    $(".settings").fadeOut(500);

    var tl = gsap.timeline();
    tl.to(".fadeOne", { opacity: 1, duration: 1 });
    tl.to(".fadeTwo", { opacity: 1, duration: 1 }, '-=0.5');

    this.jaraPercent = this.jaraService.jaraPercent() + '%';
    this.jaraFull = this.jaraService.getJaraFull();
    this.jaraKomkom = this.jaraService.getKomkom();

    await this.storage.get('sabinusid').then((val) => {
      if (!val) {
        this.isLoggedIn = false;
      } else {
        this.isLoggedIn = true;
        this.sabinusId = val;
        // retrieve and log video clicks
        this.storage.get('videoclicks').then((valc) => {
          this.videoclicks = parseInt(valc);
          this.storage.set('videoclicks', this.videoclicks);
        });
        this.userService.logVideoChecks(this.sabinusId, this.videoclicks);
      }
    });
//background mode for sound service
//     this.backgroundMode.enable();
//     this.backgroundMode.on("activate").subscribe(()=>{
//       this.soundService.stopThemeSong();
//     });

  }


  toast(tm) {

    this.toastMessage = tm;
    $(".toast").fadeIn();
    setTimeout(() => {
      $(".toast").fadeOut();
    }, 3000);
    setTimeout(() => {
      this.toastMessage = "";
    }, 4000);

  }
/*
  setText(field, value){
    this.payload[field] = value;
  }*/

  sendMessage(){
    const title = (<HTMLInputElement>document.getElementById("title")).value;
    const message = (<HTMLInputElement>document.getElementById("message")).value;

    this.userService.sendmail(this.sabinusId, title, message).subscribe((res) => {
      this.toast("Congrats, ya message don send");
      this.resetMail();
    });

  }

  resetMail(){
    (<HTMLInputElement>document.getElementById("title")).value = "";
    (<HTMLInputElement>document.getElementById("message")).value = "";
  }
  back(){
    this._location.back();
  }


}
