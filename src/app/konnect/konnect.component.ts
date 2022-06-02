import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Storage } from '@ionic/storage';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ToastController } from '@ionic/angular';
import { Location } from '@angular/common';

import * as $ from 'jquery';

@Component({
  selector: 'app-konnect',
  templateUrl: './konnect.component.html',
  styleUrls: ['./konnect.component.scss'],
})
export class KonnectComponent implements OnInit {
  toastMessage: string = "";
  imageSrc:string = "../../assets/awoof/awoof.png";
  myLocation: any;
  smallie:number = 1800;
  oga:number = 3200;
  presido:number = 10500;
  chairman:number =19500;
  jagaban:number = 50000;

  constructor(
    private userService: UserService,
    private storage: Storage,
    private iab: InAppBrowser,
    private _location: Location,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    $(".networkPane").fadeOut();
  }

  social(url){
       const browser = this.iab.create(url);
  }
  
  back(){
    this._location.back();
  }

 showNetwork(){
    $(".networkPane").fadeIn();
    setTimeout(() => {
      $(".networkPane").fadeOut();
    }, 3000);
 }

checkNetwork(errorMsg){
  this.userService.fetchUser("ddd").subscribe((res) => {
    console.log("here");
    this.toast(errorMsg);
  },(err)=>{
    this.showNetwork();
  });
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

toast_error(tm){
  this.toastController.create({
      message: tm,
      position: 'bottom',
      cssClass: 'toast-error-class',
      duration: 4000,
      buttons: [ {
          side: 'end',
          icon: 'close-circle',
          role: 'cancel'
        }
      ]
    }).then((toast) => {
      toast.present();
    });
}

}
