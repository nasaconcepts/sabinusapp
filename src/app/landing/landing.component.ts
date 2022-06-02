import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Facebook } from '@ionic-native/facebook/ngx';
import { UserService } from '../user.service';
import { SoundService } from '../sound.service';
import { GeoService } from '../geo.service';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import * as $ from 'jquery';
import { Platform, LoadingController, ToastController } from '@ionic/angular';
import { AppRate } from '@ionic-native/app-rate/ngx';

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Router } from '@angular/router';

import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser/ngx';
import { SafariViewController } from '@awesome-cordova-plugins/safari-view-controller/ngx';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements AfterViewInit {

  awoofNumber:number = 1;
  awoofNumbers:number[] = [];
  awoofInterval:any;
  cordova: any;

  refreshProfileInterval:any;
  notificationInterval:any;
  perk:string;
  perkNumber:number;

  sabinusId:any;
  appleId:string;
  score:number;
  gamesplayed:number;
  gameswon:number;
  gameslost:number;
  winstreak:number;
  longestwinstreak:number;
  totalscore:number;
  averagescore:number;
  highestscore:number;
  rank:number;
  level:number;
  levelMarker:number;
  cowries:number;
  gamecowries:number;
  juju:number
  giraffes:number;
  begibegi:number;
  tokens:number;
  userid:string;

  loggedIn:number = 1;
  loginMsg:string;
  showNetworkVal:number = 0;
  networkStatus: boolean = true;
  settingsVisibleL: boolean = false;
  users = { id: '', name: '', email: '', picture: { data: { url: '../../assets/landingpage/profile2.png' } } };

  opponentSelected:boolean = false;
  isLoaded:number = 0;
  currentPopup:number = 0;
  awoofCount:number = 0;
  awoofCount2:number = 0;
  challengerSelected:boolean = false;

  challenger = {
    name: "",
    sabinusid: "",
    gamesplayed: "",
    gameswon: "",
    gameslost: "",
    averagescore:"",
    currentstreak:"",
    totalscore:"",
    highestscore:"",
    longestwinstreak:""
  }

  opponent = {
    name: "",
    sabinusid: "",
    gamesplayed: "",
    gameswon: "",
    gameslost: "",
    averagescore:"",
    currentstreak:"",
    totalscore:"",
    highestscore:"",
  }

  padirequest = {
    opponentId : ""
  }

  error={
    status: false,
    msg: ""
  }

  notifications:any[];
  notificationslength:number=0;

  padiplayRole:string = "challenger";
  padiplayGameId:any;

  public isGoogleLogin = false;
  public user = null;

  padiplayResult:string = "";

  toastMessage:string="";

  howToImage:string = "../../assets/landingpage/howtoplay/pot.png";
  howToXter:string = "../../assets/landingpage/howtoplay/helper1.png";
  howToText:string = "";
  howToPane:number = 1;

  minDeadline:number;
  counter:number;
  soundStat: boolean = true;
  sfxStat: boolean = true;

  tumbumResultImage:string = "totem";
  

  @ViewChild("paneImg") paneImg: ElementRef;

  rankName = ["Johny Just Come", "I DEY COUNT BRIDGE", "SMALLIE", "JUNIOR SABINUS"]
  rankDef: any;

  constructor(public platform: Platform, private storage: Storage, private fb: Facebook,
    private google: GooglePlus, private userService: UserService, private soundService: SoundService,
    private geoService: GeoService,
    // private fireAuth: AngularFireAuth,
    private iab: InAppBrowser,
    private ngxService: NgxUiLoaderService, private router: Router, public loadingController: LoadingController,
     private toastController: ToastController,
     private appRate: AppRate, private alertController: AlertController,
     private safariViewController: SafariViewController
    ) {
      
  }

  async ngOnInit() {
    // If using a custom driver:
    // await this.storage.defineDriver(MyCustomDriver)
    await this.storage.create();
  }

  async ngAfterViewInit() {
    this.isLoaded=0;
    this.tokens=2;

    setTimeout(() => {
      console.log("loader")
      $(".loader").fadeOut();
    }, 4000);
    setTimeout(() => {
      this.isLoaded=1;
      console.log("isLoaded");
    }, 4500);

    this.loginMsg="";

    //before fetch profile set a test profile for nubeerodev
    //: val use this to test the flow for a default logged in user - this.sabinusId="nubeerodev"

    //this.storage.set('sabinusid', null);
    this.storage.set('sabinusid', 'a44e5cm');
    //this.storage.set('sabinusid', null);
    //this.storage.set('howTo', false);

    //this.storage.set('sabinusid', 'akinwale10');
    //fetch local profile from storage
    await this.fetchProfile();
    
    // this.storage.set('welcomePack', false);
    //:val Sound Service minimize/restore fix
    this.soundService.playThemeSong();

    this.notificationInterval=setInterval(()=>{
      this.fetchNotifications();
    },10000);

    this.platform.pause.subscribe(()=>{
      console.log("paused");
      this.soundService.stopThemeSong();
      clearInterval(this.refreshProfileInterval);
    })
    this.platform.resume.subscribe(()=>{
      console.log("resumed");
      this.refreshProfileInterval =setInterval(()=>{
        this.refreshProfile();
      },10000);
      this.soundService.playThemeSong();
    })

    this.refreshProfileInterval= setInterval(()=>{
      this.refreshProfile();
    },10000);

    this.platform.ready().then(() => {
      document.addEventListener("backbutton", function(event){
        console.log("Back button clicked");
        event.preventDefault();
        return;
      }, false);
    })

  }

  
  loginGoogle(){
    this.loginMsg="";
    
    this.platform.ready().then(() => {
      this.google.login({}).then((res) => {
        console.log(JSON.stringify(res));
        this.storage.set('userid', res.id);
        //this.users = { id: res.userId, name: res.displayName, email: res.email, picture: { data: { url: res.imageUrl } } };
        this.users = { id: res.userId, name: res.displayName, email: res.email, picture: { data: { url: '../../assets/landingpage/profile2.png' } } };
        let user = {
          userid: res.userId,
          name: res.displayName,
          email: res.email,
          image: res.imageUrl,
        }
        this.saveUser(user);
        this.loggedIn = 1;
        this.loginMsg = "";
      })
      .catch((err) => {
        this.checkNetwork("Error: "+JSON.stringify(err));
        console.log("error: ",JSON.stringify(err));
        this.loggedIn = 0;
      });
    })

    $(".fbPane").fadeOut();
  }

  getFbStatus(){

    this.fb.getLoginStatus()
    .then(res => {
      console.log(JSON.stringify(res));
      console.log(res.status);
      if (res.status == "connect") {
        this.loggedIn = 1;
        this.loginMsg="";
      } else {
        this.loggedIn = 0;
        this.fbLogin();
      }
    })
    .catch(e => {
      this.toast("Error: "+JSON.stringify(e))
      console.log(e);
    });

  }

  fbLogin() {
    $(".fbPane").fadeOut();
    this.loginMsg="";
    this.doFbLogin();
  }

  openAppleSignIn() {
    this.loginMsg="";

    const myState = Date.now();

    this.storage.set('appleId', myState); 
    this.appleId = myState.toString();
    let url = `https://appleid.apple.com/auth/authorize?client_id=io.sabinus.apps&redirect_uri=https%3A%2F%2Fayamsabinus.com%2Fsabinus-api%2Fsuccess.php&response_type=code%20id_token&scope=name%20email&state=${myState}&nonce=nonce&response_mode=form_post&frame_id=2a2818f3-2bf9-4f5b-a124-04244176b555&m=12&v=1.5.4`;
    const browser = this.iab.create(url);
    browser.on("loadstop").subscribe((event: InAppBrowserEvent) => {
          browser.close();
        });
  }

  openAppleSignIn1(){

    this.loginMsg="";

    const myState = Date.now();
    this.storage.set('appleId', myState); 
    this.appleId = myState.toString();
    let url = `https://appleid.apple.com/auth/authorize?client_id=io.sabinus.apps&redirect_uri=https%3A%2F%2Fayamsabinus.com%2Fsabinus-api%2Fsuccess.php&response_type=code%20id_token&scope=name%20email&state=${myState}&nonce=nonce&response_mode=form_post&frame_id=2a2818f3-2bf9-4f5b-a124-04244176b555&m=12&v=1.5.4`;
    
    this.platform.ready().then(() => {
      this.safariViewController.isAvailable()
      .then((available: boolean) => {
          if (available) {

            this.safariViewController.show({
              url: url,
              hidden: false,
              animated: false,
              transition: 'curl',
              enterReaderModeIfAvailable: true,
              tintColor: '#ff0000'
            })
            .subscribe((result: any) => {
                if(result.event === 'opened') console.log('Opened');
                else if(result.event === 'loaded') console.log('Loaded');
                else if(result.event === 'closed') console.log('Closed');
              },
              (error: any) => console.error(error)
            );

          } else {
            const browser = this.iab.create(url);
          }
        }
      );
    });
  }
    
  async saveUser(user){
    await this.userService.registerUsersJsonp(user).subscribe((res) => {
      this.sequencing();
      this.storage.set('sabinusid', res["user"][0]["sabinusid"]);
      this.sabinusId = res["user"][0]["sabinusid"];

      this.storage.set('cowries', res["user"][0]["cowries"]);
      this.cowries = Number(res["user"][0]["cowries"]);

      this.storage.set('tokens', res["user"][0]["tokens"]);
      this.tokens = res["user"][0]["tokens"];

      this.storage.set('giraffes', res["user"][0]["giraffes"]);
      this.giraffes = res["user"][0]["giraffes"];

      this.storage.set('begibegi', res["user"][0]["begibegi"]);
      this.begibegi = res["user"][0]["begibegi"];

      this.storage.set('juju', res["user"][0]["juju"]);
      this.juju = res["user"][0]["juju"];
      this.toast("Login successful..");
    },(err)=>{
      this.checkNetwork("Error: "+JSON.stringify(err));
    });
  }

  // fb
  logout() {
    this.fb.logout()
      .then( res => this.loggedIn = 0)
      .catch(e => console.log('Error logout from Facebook', e));
  }

  closeNetwork(){
    $(".networkPane").fadeOut();
  }

  async doFbLogin(){
		let permissions = ["public_profile", "email"];

		this.fb.login(permissions).then(async response =>{
      let userId = response.authResponse.userID;
      if (response.status == "connected") {
          this.loggedIn = 1;
          this.loginMsg = "";
          //Getting name and gender properties
          await this.fb.api("/me?fields=name,email,picture", permissions).then(res =>{
            this.storage.set('userid', res.id);
            let photo = res.picture;
            let userPhoto = photo.data;
            let userImg = userPhoto.url;
            // res.picture.data.url
            let user = {
              userid: res.id,
              name: res.name,
              email: res.email,
              image: userImg,
            }
            this.saveUser(user);
          }).catch(err => {
            this.checkNetwork("Error: "+JSON.stringify(err));
            console.log(err);
          });
      } else {
            this.loggedIn = 0;
            this.checkNetwork("Something went wrong");
      }

		}, (error) =>{
			this.checkNetwork("Error: "+JSON.stringify(error));
      // alert("save user error: "+ error);
      console.log(error);
		});
	}

	async presentLoading(loading) {
		return await loading.present();
	}

  // generateUid(){
  //   return this.randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  // }

//   randomString(length, chars) {
//     var result = '';
//     for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
//     return result;
// }

closeFbPane(){
  $(".fbPane").fadeOut();
  this.loginMsg="";
  this.sequencing();
}

closeApplePane(){
  $(".applePane").fadeOut();
  this.loginMsg="";
  this.sequencing();
}

sequencing(){

  this.storage.get('howTo').then((val) => {
    this.counter = 1;
    console.log("How to",val)
    if (val) {
      $(".howToPane").css({display: "none"});
      this.welcomePackLogic();
    }
    else{
      console.log("Else",val)
      this.howToText="Tap the letters make you form the correct pidgin word(s). How many you fit find?";
      this.currentPopup = 1;
    }
  });

}

async refreshProfile(){
  let cowrieChange = 0;
  await this.storage.get('score').then((val) => {
    this.score = !val || val == null || val < 0 ? 0 : val;
  });
  await this.storage.get('rank').then((val) => {
    this.rank = !val || val == null || val < 0 ? 1 : val;
    this.getRankTitle(this.rank);
  });
  await this.storage.get('level').then((val) => {
    this.level = !val || val == null || val < 0 ? 1 : val;
  });

  await this.storage.get('levelMarker').then((val) => {
    this.levelMarker = !val || val == null || val < 0 ? 0 : val;
  });
  await this.storage.get('gamesplayed').then((val) => {
    this.gamesplayed = !val || val == null || val < 0 ? 0 : val;
    console.log("games played",this.gamesplayed);
  });
  await this.storage.get('gameswon').then((val) => {
    this.gameswon = !val || val == null || val < 0 ? 0 : val;
  });
  await this.storage.get('gameslost').then((val) => {
    this.gameslost = !val || val == null || val < 0 ? 0 : val;
  });
  await this.storage.get('totalscore').then((val) => {
    this.totalscore = !val || val == null || val < 0 ? 0 : val;
  });
  await this.storage.get('winstreak').then((val) => {
    this.winstreak = !val || val == null || val < 0 ? 0 : val;
  });
  await this.storage.get('longestwinstreak').then((val) => {
    this.longestwinstreak = !val || val == null || val < 0 ? 0 : val;
  });
  await this.storage.get('highestscore').then((val) => {
    this.highestscore = !val || val == null || val < 0 ? 0 : val;
  });
  await this.storage.get('averagescore').then((val) => {
    this.averagescore = !val || val == null || val < 0 ? 0 : val;
  });//rank, score, level, levelMarker, gamesplayed, gameswon, gameslost, totalscore, winstreak, longestwinstreak, highestscore, averagescore
  await this.storage.get('cowries').then((val) => {
    let cowries = (!val || val == null || val < 0)?0:parseInt(val);
    if(Number(this.cowries) < Number(cowries)){
      cowrieChange = 1;
    }
    this.cowries = val;
  });
  console.log("cowrie change",cowrieChange);

  if(cowrieChange !== 0){
    console.log("cowrie change 2:",cowrieChange);
    await this.userService.logPlayerCowriesProgressive(this.sabinusId, Number(this.cowries)).subscribe((res)=>{ });
  }
}

async fetchProfile(){

  await this.storage.get('score').then((val) => {
    this.score = !val || val == null || val < 0 ? 0 : val;
    this.storage.set('score', this.score);
  });

  await this.storage.get('rank').then((val) => {
    this.rank = !val || val == null || val < 0 ? 1 : val;
    this.getRankTitle(this.rank);
    this.storage.set('rank', this.rank);
  });

  await this.storage.get('level').then((val) => {
    this.level = !val || val == null || val < 0 ? 1 : val;
    this.storage.set('level', this.level);
  });

  await this.storage.get('levelMarker').then((val) => {
    // this.levelMarker = 0;
    this.levelMarker = !val || val == null || val < 0 ? 0 : val;
    this.storage.set('levelMarker', this.levelMarker);
  });

  await this.storage.get('userid').then((val) => {
    this.userid = !val || val == null || val < 0 ? null : val;
    this.storage.set('userid', this.userid);

  });
  await this.storage.get('gamesplayed').then((val) => {
    this.gamesplayed = !val || val == null || val < 0 ? 0 : val;
    this.storage.set('gamesplayed', this.gamesplayed);

  });
  await this.storage.get('gameswon').then((val) => {
    this.gameswon = !val || val == null || val < 0 ? 0 : val;
    this.storage.set('gameswon', this.gameswon);

  });
  await this.storage.get('gameslost').then((val) => {
    this.gameslost = !val || val == null || val < 0 ? 0 : val;
    this.storage.set('gameslost', this.gameslost);

  });
  await this.storage.get('totalscore').then((val) => {
    this.totalscore = !val || val == null || val < 0 ? 0 : val;
    this.storage.set('totalscore', this.totalscore);
  });
  await this.storage.get('winstreak').then((val) => {
    this.winstreak = !val || val == null || val < 0 ? 0 : val;
    this.storage.set('winstreak', this.winstreak);
  });
  await this.storage.get('longestwinstreak').then((val) => {
    this.longestwinstreak = !val || val == null || val < 0 ? 0 : val;
    this.storage.set('longestwinstreak', this.longestwinstreak);
  });
  await this.storage.get('highestscore').then((val) => {
    this.highestscore = !val || val == null || val < 0 ? 0 : val;
    this.storage.set('highestscore', this.highestscore);
  });
  await this.storage.get('averagescore').then((val) => {
    this.averagescore = !val || val == null || val < 0 ? 0 : val;
    this.storage.set('averagescore', this.averagescore);
  });

  //:val why setting this to zero
  // await this.setAddPerks("cowries", 0);
  // await this.setAddPerks("giraffes", 0);
  // await this.setAddPerks("begibegi", 0);
  // await this.setAddPerks("tokens", 0);

  //:val fix check to allow recording of cowries and perks from main landing screen

  await this.storage.get('cowries').then((val) => {
    this.cowries = !val || val == null || val < 0 ? 0 : parseInt(val);
    this.storage.set('cowries', Number(this.cowries));
  });
  await this.storage.get('juju').then((val) => {
    this.juju = !val || val == null || val < 0 ? 0: val;
    this.storage.set('juju', this.juju);
  });
  await this.storage.get('giraffes').then((val) => {
    this.giraffes = !val || val == null || val < 0 ? 0 : val;
    this.storage.set('giraffes', this.giraffes);
  });
  await this.storage.get('begibegi').then((val) => {
    this.begibegi = !val || val == null || val < 0 ? 0 : val;
    this.storage.set('begibegi', this.begibegi);
  });
  await this.storage.get('tokens').then((val) => {
    this.tokens = !val || val == null || val < 0 ? 0 : val;
    this.storage.set('tokens', this.tokens);
  });

  await this.storage.get('sabinusid').then((val) => {
    if (!val) {
      this.loggedIn = 0;
      this.loginMsg = "Save ya hard work make you fit play on top any device!";

      //:val we need a definite way to ensure the local profile is synced to the remote profile
      //:val proceed to fetch remote profile

    }else{
      this.sequencing();
      this.loggedIn = 1;
      this.loginMsg ="";
      this.sabinusId = val;
      this.fetchProfileRemote(this.sabinusId);
      this.setGamePerks();
    }
    console.log("logged in state",val);
  });
}

fetchProfilePadi(sid){
    this.userService.fetchUser(sid).subscribe((res) => {
      this.updateProfile(res);
    });

}

fetchProfileRemote(sid){
    this.userService.fetchUser(sid).subscribe((res) => {

      if(res["user"].length ===0) return;
      if(!this.sabinusId){
        this.storage.set('sabinusid', res["user"][0]["sabinusid"]);
        this.sabinusId = res["user"][0]["sabinusid"];
      }

      if(Number(this.cowries) < Number(res["user"][0]["cowries"])){
        this.cowries = res["user"][0]["cowries"];
        this.storage.set('cowries', Number(this.cowries));
      }

      if(Number(this.juju) < Number(res["user"][0]["juju"])){
        this.juju = res["user"][0]["juju"];
        this.storage.set('juju', Number(this.juju));
      }
      if(Number(this.giraffes) < Number(res["user"][0]["giraffes"])){
        this.giraffes = res["user"][0]["giraffes"];
        this.storage.set('giraffes', Number(this.giraffes));
      }
      if(Number(this.begibegi) < Number(res["user"][0]["begibegi"])){
        this.begibegi = res["user"][0]["begibegi"];
        this.storage.set('begibegi', Number(this.begibegi));
      }

      if(Number(this.tokens) < Number(res["user"][0]["token"])){
        this.tokens = res["user"][0]["tokens"];
        this.storage.set('tokens', Number(this.tokens));
      }

      this.updateProfile(res);
    });

    this.logGameScore();
}

async logGameScore(){
  this.userService.logPlayerCowries(this.sabinusId, Number(this.cowries)).subscribe((res)=>{ });
}

setGamePerks(){
    this.userService.setPlayerPerks(this.sabinusId,this.juju,this.giraffes,this.begibegi,this.tokens)
    .subscribe((res)=>{});
}

backupProfile(){
  this.setGamePerks();
  this.logGameScore();
  //this.closeProfile();
}

introducePadiplay(){
  if (this.tokens < 1) {

    this.toast("Ya totem no reach. Make you try buy");
    return;
  }else{

    $(".padiPane").fadeIn();
  }
}

preStartGame(){
  $(".start1").fadeOut();
  setTimeout(() => {
    $(".start2").fadeIn();
  }, 1100);
}

startGame(){
  $(".startPane").fadeOut();
}

closePadiPlay(){
  $(".padiPane").fadeOut();
}

closePadiPlay2(){
  $(".padiPaneTwo").fadeOut();
  this.opponentSelected = false;
  this.opponent = {name: "",sabinusid: "",gamesplayed: "",gameswon: "",gameslost: "",averagescore:"",currentstreak: "",totalscore:"",highestscore:""}
}

//:val used this for testing Padiplay
  introducePadiplay2Test(){
    // alert(this.sabinusId);
  //this.sabinusId="nubeerodev";

    if (!this.sabinusId || this.sabinusId == undefined || this.sabinusId == null) {
      $(".fbPane").fadeIn();
      this.ngxService.stop();
      return;
    }
    this.ngxService.start();
    this.userService.findOpponent(this.sabinusId)
        .subscribe((res) => {

          this.storage.set('tokens', this.tokens);
          this.ngxService.stop();
          if (res["user"].length < 1) {
            this.error.status = true;
            this.error.msg = "No matching user found";
            this.clearError();
          }else{
            $(".padiPaneTwo").fadeIn();
            $(".padiPane").fadeOut();
            this.challenger.name = res["user"][0]["uname"];
            this.challenger.sabinusid = res["user"][0]["sabinusid"];
            this.challenger.gamesplayed = res["stats"][0]["gamesplayed"];
            this.challenger.gameswon = res["stats"][0]["gameswon"];
            this.challenger.gameslost = res["stats"][0]["gameslost"];

            this.challengerSelected = true;
//:val i think this is good place to set PadiPlay stats so that profile is updated when padiPlay figures are Pulled from the serverthis......
            this.challenger.averagescore = res["stats"][0]["averagescore"];

            this.challenger.currentstreak = res["stats"][0]["winstreak"];
            this.challenger.longestwinstreak = res["stats"][0]["longestwinstreak"];
            this.challenger.highestscore =  res["stats"][0]["highestscore"];
            
            this.winstreak=Number(this.challenger.currentstreak);
            this.gamesplayed = Number(this.challenger.gamesplayed);
            this.gameswon = Number(this.challenger.gameswon);
            this.gameslost = Number(this.challenger.gameslost);
            this.totalscore = Number(this.challenger.totalscore);
            this.winstreak = Number(this.challenger.currentstreak);
            this.longestwinstreak = Number(this.challenger.longestwinstreak);
            this.averagescore = Number(this.challenger.averagescore);
            this.highestscore = Number(this.challenger.highestscore);

            this.storage.set('gamesplayed', Number(this.challenger.gamesplayed));
            this.storage.set('gameswon', Number(this.challenger.gameswon));
            this.storage.set('gameslost', Number(this.challenger.gameslost));
            this.storage.set('totalscore', Number(this.challenger.totalscore));
            this.storage.set('winstreak', Number(this.challenger.currentstreak));
            this.storage.set('longestwinstreak', Number(this.challenger.longestwinstreak));
            this.storage.set('averagescore', Number(this.challenger.averagescore));
            this.storage.set('highestscore',Number(this.challenger.highestscore));
          }
        });
  }


introducePadiplay2Prod(){
  // alert(this.sabinusId);
  console.log("here opponent");
  if (!this.sabinusId || this.sabinusId == undefined || this.sabinusId == null) {
    $(".fbPane").fadeIn();
    this.loginMsg = "Save ya hard work make you fit play on top any device!";
    this.ngxService.stop();
    return;
  }

  this.ngxService.start();
  this.userService.findOpponent(this.sabinusId)
  .subscribe((res) => {

    this.storage.set('tokens', this.tokens);
    this.ngxService.stop();
    if (res["user"].length < 1) {
      this.error.status = true;
      this.error.msg = "No matching user found";

      this.clearError();
    }else{
      $(".padiPaneTwo").fadeIn();
      $(".padiPane").fadeOut();
      this.challenger.name = res["user"][0]["uname"];
      this.challenger.sabinusid = res["user"][0]["sabinusid"];
      this.challenger.gamesplayed = res["stats"][0]["gamesplayed"];
      this.challenger.gameswon = res["stats"][0]["gameswon"];
      this.challenger.gameslost = res["stats"][0]["gameslost"];
      this.challengerSelected = true;

      this.updateProfile(res);
      this.storage.set('tokens', this.tokens);
    }
    console.log("Error:",this.error.msg);
  },
       () => {
         this.ngxService.stop();
         console.log("error");
         $(".padiPane").fadeOut();
         this.checkNetwork("You neva login");
       });
}

updateProfile(res){
  this.gamesplayed = Number(res["user"][0]["gamesplayed"]);
  this.gameswon = Number(res["user"][0]["gameswon"]);
  this.gameslost = Number(res["user"][0]["gameslost"]);
  this.totalscore = Number(res["user"][0]["totalscore"]);
  this.winstreak = Number(res["user"][0]["winstreak"]);
  this.longestwinstreak = Number(res["user"][0]["longestwinstreak"]);
  this.averagescore = Number(res["user"][0]["averagescore"]);
  this.highestscore = Number(res["user"][0]["highestscore"]);

  this.storage.set('gamesplayed', Number(res["user"][0]["gamesplayed"]));
  this.storage.set('gameswon', Number(res["user"][0]["gameswon"]));
  this.storage.set('gameslost', Number(res["user"][0]["gameslost"]));
  this.storage.set('totalscore', Number(res["user"][0]["totalscore"]));
  this.storage.set('winstreak', Number(res["user"][0]["winstreak"]));
  this.storage.set('longestwinstreak', Number(res["user"][0]["longestwinstreak"]));
  this.storage.set('averagescore', Number(res["user"][0]["averagescore"]));
  this.storage.set('highestscore', Number(res["user"][0]["highestscore"]));
}
selectOpponent(){
  if (this.opponentSelected) {
    return;
  }

  $(".padiMain").fadeOut();
  $(".sabinusCodePane").fadeIn();
}

fetchOpponent(opponentId){
  if (opponentId.length < 1) {
    return;
  }
  console.log("here opponent");
  this.ngxService.start();
  let sabinusId = opponentId;
  this.userService.findOpponent(sabinusId).subscribe((res) => {
    $(".padiMain").fadeIn();
    $(".sabinusCodePane").fadeOut();
    this.ngxService.stop();
    this.padirequest.opponentId = "";
    /*
    $(".padiMain").fadeIn();
    $(".sabinusCodePane").fadeOut();
    */
    if (res["user"].length < 1) {
      this.error.status = true;
      this.error.msg = "No matching user found";
      this.clearError();
    }else{
      //prevent user from choosing self as opponent
      if (this.challenger.sabinusid == res["user"][0]["sabinusid"]) {
        this.error.status = true;
        this.error.msg = "You can't choose yourself as an opponent";
        this.clearError();
        return;
      }

      this.opponent.name = res["user"][0]["uname"];
      this.opponent.sabinusid = res["user"][0]["sabinusid"];
      this.opponent.gamesplayed = res["stats"][0]["gamesplayed"];
      this.opponent.gameswon = res["stats"][0]["gameswon"];
      this.opponent.gameslost = res["stats"][0]["gameslost"];

      this.opponentSelected = true;
      // console.log(res["user"]);
    }
  },(err)=>{
    this.padirequest.opponentId = "";
    $(".padiMain").fadeIn();
    $(".sabinusCodePane").fadeOut();
    this.ngxService.stop();

    //check network    
    this.checkNetworkPadiPlay("There was an error finding an opponent, please try again later");
    
  });
}

clearError(){
  setTimeout(() => {
    this.error.status = false;
    this.error.msg = "";
  }, 4000);
}

generateInitials(fullname){
  return `${fullname.split(" ")[0].charAt(0).toUpperCase() || ""}` + `${fullname.split(" ")[1].charAt(0).toUpperCase()  || ""}`;
}

generateFirstName(fullname){
  return fullname.split(" ")[0];
}

playGame(){
  if (!this.opponentSelected) {
    return;
  }
  if(this.tokens > 0){
    this.tokens -= 1;
  }
  this.storage.set('tokens', Number(this.tokens));

  let playdata = {
    challengerId: this.challenger.sabinusid,
    opponentId: this.opponent.sabinusid,
    role: this.padiplayRole,
    gameId: this.padiplayGameId || null
  }

  this.closePadiPlay2();
  this.router.navigate(['/padiplay', JSON.stringify(playdata)]);
  
}

fetchNotifications(){
  if(!this.sabinusId && this.appleId && this.appleId.length > 2){
    this.fetchProfileRemote(this.appleId);
    return;
  }
  if (!this.sabinusId) {
    return;
  }
  this.userService.getNotifications(this.sabinusId).subscribe((res) => {
    if (res["notifications"].length > 0) {
          this.notifications = res["notifications"];
          this.notificationslength = this.notifications.length;
          console.log("notification: ",JSON.stringify(this.notifications));
          let deadlineArr = [];
          for (let i = 0; i < this.notifications.length; i++) {
            const element = this.notifications[i];
            deadlineArr.push( this.hourdifference( new Date(element.reg_date), new Date()) );
          }
          let min = Math.min.apply(Math,deadlineArr);
          if (min < 24) { this.minDeadline = Math.abs(24 - min)}
          
          this.fetchProfileRemote(this.sabinusId);
    }
    this.networkStatus = true;
  },function(){
    this.networkStatus = false;
    //this.toast("Check ya network make you try again");
  });
}

analyseDeadline(dt){
  let diff = this.hourdifference( new Date(dt), new Date());
  if (diff < 24) {
    return diff;
  }
  return false;
}

showNotifications(){
  $(".notificationsPane").fadeIn().css({display:"flex"});
}

closeNotificationsPane(){
  $(".notificationsPane").fadeOut();
}

async clickNotification(type, senderId, recepientid, gameid, nid){
  this.markasRead(nid);
  $(".notificationsPane").fadeOut();
  if (type == "challenge") {
    this.padiplayRole = "opponent";
    this.padiplayGameId = gameid;
    this.ngxService.start();

    await this.fetchChallenger(senderId);
    await this.fetchChallenged(recepientid);
    this.ngxService.stop();
    $(".padiPaneTwo").fadeIn();
  }else{
    // alert(type);
    this.padiplayResult = type;
    $(".padiplayResult").fadeIn().css({display:"flex"});
    $(".resultImage").fadeIn();
    $(".resultImage").addClass("animate__tada");

    this.fetchProfilePadi(recepientid);
    // just added
    if(this.padiplayResult == "won") {
      this.storage.get('begibegi').then((val) => {
        let begibegi = !val || val == null ? 1 : parseInt(val)+1;
        this.storage.set('begibegi', begibegi);
      });

      this.storage.get('giraffes').then((val) => {
        let giraffes = !val || val == null ? 1 : parseInt(val)+1;
        this.storage.set('giraffes', giraffes);
      });

      this.storage.get('cowries').then((val) => {
        let cowries = !val || val == null ? 1200 : parseInt(val)+1200;
        this.storage.set('cowries', cowries);
        this.cowries = cowries;
      });

      this.storage.get('juju').then((val) => {
        let juju = !val || val == null ? 1 : parseInt(val)+1;
        this.storage.set('juju', juju);
        this.juju = juju;
      });

      this.storage.get('tokens').then((val) => {
         let tokens = !val || val == null ? 2 : parseInt(val)+2;
         this.storage.set('tokens', tokens);
         this.tokens = tokens;
      });
      this.backupProfile();
    }else if (this.padiplayResult == "draw") {
      // console.log("got here 2");
      this.storage.get('tokens').then((val) => {
        let tokens = !val || val == null ? 1 : parseInt(val)+1;
        this.storage.set('tokens', tokens);
      });
    }

  }
  //end if type == challenge
}

closeResult(){
  $(".resultImage").fadeOut();
  $(".padiplayResult").fadeOut();
  $(".resultImage").removeClass("animate__tada");
}

markasRead(nid){
  this.removeItem(nid);
  this.userService.markRead(nid).subscribe((res) => {
      console.log(res["data"]);
      this.fetchNotifications()
  });
}

removeItem(nid) {
  this.notifications = this.notifications.filter( notification => notification.id !== nid );
  this.notificationslength = this.notifications.length;

}

async fetchChallenger(senderId){
  await this.userService.findOpponent(senderId)
  .subscribe((res) => {
    if (res["user"].length < 1) {
      this.error.status = true;
      this.error.msg = "No matching user found";
      this.clearError();
    }else{
      this.challenger.name = res["user"][0]["uname"];
      this.challenger.sabinusid = res["user"][0]["sabinusid"];
      this.challenger.gamesplayed = res["stats"][0]["gamesplayed"];
      this.challenger.gameswon = res["stats"][0]["gameswon"];
      this.challenger.gameslost = res["stats"][0]["gameslost"];
      this.challengerSelected = true;
    }
  },(err)=>{
    this.error.status = true;
    this.error.msg = "There was an error finding an opponent, please try again later";
    this.clearError();

  });
}

async fetchChallenged(sabinusId){
  await this.userService.findOpponent(sabinusId)
  .subscribe((res) => {
    if (res["user"].length < 1) {
      this.error.status = true;
      this.error.msg = "No matching user found";
      this.clearError();
    }else{
      this.opponent.name = res["user"][0]["uname"];
      this.opponent.sabinusid = res["user"][0]["sabinusid"];
      this.opponent.gamesplayed = res["stats"][0]["gamesplayed"];
      this.opponent.gameswon = res["stats"][0]["gameswon"];
      this.opponent.gameslost = res["stats"][0]["gameslost"];
      this.opponentSelected = true;
    }
  },(err)=>{
    this.error.status = true;
    this.error.msg = "There was an error finding an opponent, please try again later";
    this.clearError();
  });

}

// tumbum
closeTumbum(){
  $(".tumbumPane").fadeOut();
}

generateAwoofNumbers(){
  let awoofNumbers = [];
  let shuffleWithin = [10,20,30,40,60,70,80,30,20];
  const shuffle = arr => arr.sort(() => .5 - Math.random());
  let getRandomArrShuffle = shuffle(shuffleWithin);
  for (let i = 0; i < 9; i++) {
    if(i == 3 || i == 4 || i == 6 || i == 7) {
      awoofNumbers.push(1);
    } else {
      awoofNumbers.push(getRandomArrShuffle[i]);
    }
  }
  this.awoofNumbers = awoofNumbers;
}

dailyAwoof(){
  var d = new Date();
  console.log("inside tumbum")
  // this.storage.set('lastAwoof',null);
  this.storage.get('lastAwoof').then((val) => {
    console.log("Tumbum Checks");
    // val = val == null ? d.getTime() : val;
    this.awoofCount2=1;
    if (val == null || val == undefined) {
      this.currentPopup=2;
      console.log("Tumbum Checks 1");
      this.generateAwoofNumbers();
      $(".tumbumPane").fadeIn();
      this.makeAwoofRotateNormal();

      return;
    }

    let diffDays = this.daydifference(new Date(val),d);
    if (!diffDays) {
      this.currentPopup=2;
        this.generateAwoofNumbers();
        $(".tumbumPane").fadeIn();
        console.log("Tumbum Checks 2");
        this.makeAwoofRotateNormal();
    }
  });
}

makeAwoofRotateNormal() {
  this.awoofInterval = setInterval(()=>{
    this.awoofCount += 1;
    if(this.awoofCount % this.awoofCount2==0){
      console.log("Athans",this.awoofCount2);
      if(this.awoofCount2==0){
        clearInterval(this.awoofInterval);
      }
      else if (this.awoofNumber < 9) {
        this.awoofNumber +=1;
      }else{
        this.awoofNumber = 1;
      }
    }
  }, 200)
}


async selectAwoof(){

  this.awoofCount2 = 0;
  var d = new Date();
  //this.storage.set('lastAwoof',null);
  this.storage.get('lastAwoof').then(async (val) => {
      val = val == null ? d.getTime() : val;
      this.awoofCount2=6;
      if (val == null || val == undefined) {
        // this.generateAwoofNumbers();
        $(".tumbumPane").fadeIn();
        await this.makeAwoofRotateNormal();
        return;
      }

      this.generateAwoofNumbers();

      //$(".tumbumPane").fadeIn();

      this.makeAwoofRotateNormal();

  });

  setTimeout(()=>{
    this.selectAwoof2();
  }, 2000)

}

async setCowries(cowrie){
    let val = !this.cowries || this.cowries == null || Number(this.cowries) < 0 ? 0 : Number(this.cowries);
    val += cowrie;
    this.cowries = val;
    this.storage.set('cowries', Number(this.cowries));
}

async setGiraffe(giraffes){
    let val = !this.giraffes || this.giraffes == null || Number(this.giraffes) < 0 ? 0 : Number(this.giraffes);
    val += giraffes;
    this.giraffes = val;
    this.storage.set('giraffes', Number(this.giraffes));
}

async setBegibegi(begibegi){
    let val = !this.begibegi || this.begibegi == null || Number(this.begibegi) < 0 ? 0 : Number(this.begibegi);
    val += begibegi;
    this.begibegi = val;
    this.storage.set('begibegi', Number(this.begibegi));
}

async setJuju(juju){
    let val = !this.juju || this.juju == null || Number(this.juju) < 0 ? 0 : Number(this.juju);
    val += juju;
    this.juju = val;
    this.storage.set('juju', Number(this.juju));
}

async selectAwoof2(){
  clearInterval(this.awoofInterval);
  this.awoofCount2 = 0;
  let perk,perkNumber;
  if (!this.sabinusId) {
    this.toast("You neva login")
    this.closeTumbum();
    return;
  }

  switch(this.awoofNumber) {
    case 1:
      perk = "cowries";
      perkNumber = this.awoofNumbers[0];
      this.tumbumResultImage = "cowries";
      this.setCowries(perkNumber);
      this.userService.logPlayerCowriesProgressive(this.sabinusId,perkNumber);
      break;
    case 2:
       perk = "cowries";
       perkNumber = this.awoofNumbers[1];
       this.tumbumResultImage = "cowries";
       this.setCowries(perkNumber);
       this.userService.logPlayerCowriesProgressive(this.sabinusId,perkNumber);
      break;
    case 3:
      perk = "cowries";
      perkNumber = this.awoofNumbers[2];
      this.tumbumResultImage = "cowries";
      this.setCowries(perkNumber);
      this.userService.logPlayerCowriesProgressive(this.sabinusId,perkNumber);
      break;
    case 4:
      perk = "totem";
      perkNumber = this.awoofNumbers[3];
      this.tumbumResultImage = "totem";
      this.userService.logPlayerPerks(this.sabinusId,0,0,0,perkNumber);
      break;
    case 5:
        perk = "giraffe";
        perkNumber = this.awoofNumbers[4];
        this.tumbumResultImage = "giraffe";
        this.setGiraffe(perkNumber);
        this.userService.logPlayerPerks(this.sabinusId,0,perkNumber,0,0);
        break;
    case 6:
        perk = "cowries";
        perkNumber = this.awoofNumbers[5];
        this.tumbumResultImage = "cowries";
        this.setCowries(perkNumber);
        this.userService.logPlayerCowriesProgressive(this.sabinusId,perkNumber);
        break;
    case 7:
        perk = "begibegi";
        perkNumber = this.awoofNumbers[6];
        this.tumbumResultImage = "begibegi";
        this.setBegibegi(perkNumber);
        this.userService.logPlayerPerks(this.sabinusId,0,0,perkNumber,0);
        break;
    case 8:
        perk = "juju";
        perkNumber = this.awoofNumbers[7];
        this.tumbumResultImage = "juju";
        this.setJuju(perkNumber);
        this.userService.logPlayerPerks(this.sabinusId,perkNumber,0,0,0);
        break;
    case 9 :
          perk = "cowries";
          perkNumber = this.awoofNumbers[8];
          this.tumbumResultImage = "cowries";
          this.setCowries(perkNumber);
          this.userService.logPlayerCowriesProgressive(this.sabinusId,perkNumber);
          break;
    default:
      // code block
  }

  this.perk = perk;
  this.perkNumber = perkNumber;

  $(".gridBox").fadeOut();
  $(".stop").fadeOut();

  $(".awoofResult").fadeIn().css({display:"flex"});

  setTimeout(() => {
    $(".smile").animate({opacity:1});
  }, 1500);

  var d = new Date();
  var lastAwoof = d.getTime();
  this.storage.set('lastAwoof', lastAwoof);
}

hourdifference(dt2, dt1) {
  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
  diff /= (60 * 60);
  return Math.abs(Math.round(diff));
 }

 daydifference(dt2, dt1) {
   let day2 = dt2.getDate();
   let day1 = dt1.getDate();
  console.log("Day 1", day2);
  console.log("Day 2", day1);

   return day2 == day1;
  }


welcomePackLogic(){
      this.storage.get('welcomePack').then((val) => {
        this.counter = 0;
        let wp= !val || val == null ? false : val;
        console.log("Welcome pack here", val)
          //wp = false; // to deleted - just temporary
        if (wp) {
          this.counter=1;
          this.dailyAwoof();
        }
        else{
          console.log("Welcome pack here")
          this.currentPopup=3;
          $(".welcomeGiftPane").fadeIn();
        }
    });
    if(this.counter==1){
      this.dailyAwoof();
    }
 }

async welcomePack(){
   $(".welcomeGiftPane").fadeOut();
   this.dailyAwoof();
  await this.setAddPerks('juju', 1);
  await this.setAddPerks('begibegi', 1);
  await this.setAddPerks('giraffes', 1);
  await this.setAddPerks('tokens', 1);
  await this.setAddPerks('cowries', 200);
  await this.storage.set('welcomePack', true);
}

showProfile(){
  $(".profilePane").fadeIn().css({display:"flex"});
}

 closeProfile(){
   $(".profilePane").fadeOut();
 }

 logoutProfile(){
      this.storage.set('sabinusid', null);
      this.loggedIn = 0;
      // this.cowries = 0;
      // this.storage.set('cowries', 0);
      this.fetchProfile();
      this.fetchNotifications();
      this.closeProfile();
 }

 loginProfile(){
      this.closeProfile();
      this.loggedIn = 0;
      $(".fbPane").fadeIn();
      this.loginMsg = "Save ya hard work make you fit play on top any device!";
 }

 showNetwork(){
   console.log("Show network");
    $(".networkPane").fadeIn();
    this.showNetworkVal=1;
    setTimeout(() => {
      $(".networkPane").fadeOut();
      this.showNetworkVal = 0;
    }, 3000);
 }

toast(tm){
  this.toastMessage = tm;
  $(".toast").fadeIn();
  setTimeout(() => {
    $(".toast").fadeOut();
  }, 3000);
  setTimeout(() => {
    this.toastMessage = "";
  }, 4000);
}

toast_error(tm){
  this.toastController.create({
      message: tm,
      position: 'bottom',
      cssClass: 'toast-error-class',
      duration: 4000,
      buttons: [ {
          side: 'start',
          text: '|',
          role: 'cancel'
        },{
            side: 'end',
            icon: 'information-circle',
          }
      ]
    }).then((toast) => {
      toast.present();
    });
}

toast_success(tm){
  this.toastController.create({
      message: tm,
      position: 'bottom',
      cssClass: 'toast-success-class',
      duration: 4000,
      buttons: [ {
          side: 'start',
          text: '|',
          role: 'cancel'
        },{
            side: 'end',
            icon: 'checkmark-circle'
          }
      ]
    }).then((toast) => {
      toast.present();
    });
}

resetAwoof(){
  this.storage.set('lastAwoof',null);
  // this.testGeo();
}

testGeo(){
  this.geoService.getCoords();
}

triggerVideo(){
  // check network
  console.log("this.sabinusId",this.sabinusId);
  if (!this.sabinusId) {
    this.checkNetwork("You neva login");
  }
  else{
    this.userService.fetchUser("ddd").subscribe((res) => {
      $(".videoPane").fadeIn().css({display:'flex'});
      this.startVideoTimer();
    },(err)=>{
      this.checkNetwork("Something went wrong");
    });
  } 
  
}

checkNetwork(errorMsg){
  let networkStatus = true;
  
  this.userService.fetchUser("ddd").subscribe((res) => {
    console.log("here");
    this.toast(errorMsg);
  },(err)=>{
    networkStatus = false;
    this.showNetwork();
  });
  console.log("this.error ",networkStatus);
  this.networkStatus = networkStatus;
}

checkNetworkPadiPlay(errorMsg){
  let networkStatus = true;
  
  this.userService.fetchUser("ddd").subscribe((res) => {
    this.error.status = true;
    this.error.msg = errorMsg;
    console.log("Error finding opponent");
    this.clearError();
  },(err)=>{
    this.closePadiPlay2();
    networkStatus = false;
    this.showNetwork();
  });
  console.log("this.error ",networkStatus);
  this.networkStatus = networkStatus;
}


closeVideo(){
  $(".videoPane").fadeOut();
}

startVideoTimer(){
  $(".skip").css({display: 'none'});
  $(".videoTime").fadeIn();
  let video = <HTMLVideoElement> document.getElementById("video");
  let vidSrc = <HTMLVideoElement> document.getElementById("vidSrc");
  const timer = document.getElementById("vtime");

  vidSrc.src = "https://ayamsabinus.com/sabinus-api/ads/ad.mp4";
  video.play();
  video.currentTime = 0;

  this.soundService.toggleSound(false);

  var vidInterval = setInterval(function () {

    if ((10 - Math.round(video.currentTime)) < 1 ) {
      $(".videoTime").fadeOut();
      setTimeout(() => {
        $(".skip").fadeIn().css({display: "flex"});
        clearInterval(vidInterval);
      }, 1000);
      return;
    }
    // progress.innerHTML = Math.round((video.currentTime / video.duration) * 100);
    timer.innerHTML = 10 - Math.round(video.currentTime) + "";
  });

}

toggleSound() {
  this.soundStat = !this.soundStat;
  this.soundService.toggleSound(this.soundStat);
}

toggleSfx() {
  this.sfxStat = !this.sfxStat;
  this.soundService.toggleSfx(this.sfxStat);
}

skip(){
  let video = <HTMLVideoElement> document.getElementById("video");
  video.pause;
  this.soundService.toggleSound(true);
  this.closeVideo();
  this.reward();
}

reward(){

  let shuffleWithin = ["juju", "begibegi", "giraffes", "tokens", "cowries"];
  let shuffleLabel = ["juju", "begibegi", "giraffing", "padiplay token", "cowries"];
  let count80 = [10, 20, 30, 40];

  let count =   Math.round(Math.random() * 10);
  let item = 'cowries';
  let label = 'cowries';
  if(count > 7){
    const shuffle20 =   Math.round(Math.random() * 4);
    if(shuffleWithin[shuffle20] === 'cowries'){
      count = 80;
      item = 'cowries';
      label = item;
    }
    else{
      count = 1;
      item = shuffleWithin[shuffle20];
      label = shuffleLabel[shuffle20];
    }
  }
  else{
    const shuffle =   Math.round(Math.random() * 3);
    count = count80[shuffle];
    item = 'cowries';
    label = item;
  }

  this.toast("reward: "+count+" "+label);
  this.soundService.playCowrieSound();

  this.setAddPerks(item, count);
}

howToClose(){
  $(".howToPane").fadeOut();
  this.welcomePackLogic();
}

howToNext(){
  // console.log("hiyaaa");
  if (this.howToPane < 2) {
    this.howToPane++;
    this.analyseHowToPane(this.howToPane);
    this.storage.set('howTo', true);
  }
}

howToPrev(){
  if (this.howToPane > 1) {
    this.howToPane--;
    this.analyseHowToPane(this.howToPane);
  }
}

awoof(){
  this.router.navigate(['/awoof']);
}

analyseHowToPane(howToPane){
  if (howToPane == 1) {
    this.howToImage = "../../assets/landingpage/howtoplay/pot.png";
    this.howToText = "Tap the letters make you form the correct pidgin word(s). How many you fit find?";
    this.howToXter = "../../assets/landingpage/howtoplay/helper1.png";
  }else if(howToPane == 2){
    this.howToImage = "../../assets/landingpage/howtoplay/instruction.png";
    this.howToText = "You dey scratch ya head for ansa? Begi Begi, Giraffing and Juju dey for you";
    this.howToXter = "../../assets/landingpage/howtoplay/helper2.png";
  }
}

getRankTitle(rank) {
  // alert("game rank: "+ rank)
  this.rankName.forEach((i, j) => {
      if((rank-1) == j) {
        this.rankDef = i;
        // alert("rank name "+ i);
      }
  });
}

// just added - kanmit
async setAddPerks(perk_type, perk_value: number) {
  await this.storage.get(perk_type).then((val) => {
      let perksVal = !val || val == null ? perk_value : parseInt(val)+perk_value;
      this.storage.set(perk_type, perksVal);

      if(perk_type == 'tokens') {
        this.tokens = perksVal;
      } else if (perk_type == 'juju') {
        this.juju = perksVal;
      } else if (perk_type == 'begibegi') {
        this.begibegi = perksVal;
      } else if (perk_type == 'giraffes') {
        this.giraffes = perksVal;
      } else if (perk_type == 'cowries') {
        this.cowries = perksVal;
      }

 });
}

rate() {
  // set certain preferences
  this.appRate.preferences.storeAppURL = {
    // ios: '<app_id>',
    android: 'market://details?id=io.sabinus.app',
    // windows: 'ms-windows-store://review/?ProductId=<store_id>'
  }

  this.appRate.promptForRating(true);
}

contact(){
  if (!this.sabinusId) {
    this.toast("You neva login")
  }
  else{
    this.router.navigate(['/contactus']);
  }
}

toggleSettings() {
  if (!this.settingsVisibleL) {
    $(".settings1").fadeIn(500);
    this.settingsVisibleL = !this.settingsVisibleL;
  } else {
    $(".settings1").fadeOut(500);
    this.settingsVisibleL = !this.settingsVisibleL;
  }

}

}


