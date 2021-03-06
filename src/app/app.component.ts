import {Component, NgZone, ViewChild} from '@angular/core';
import {AlertController, IonRouterOutlet, Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {ThemeService} from './services/theme/theme.service';
import {RouterService} from './services/router.service';
import {UserService} from './services/user/user.service';
import {AuthService} from './services/auth/auth.service';
import { UpdateAppService } from './services/update-app/update-app.service';
import { Location } from '@angular/common';
import { App } from '@capacitor/app';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    @ViewChild(IonRouterOutlet, {static: false}) routerOutlet: IonRouterOutlet;
    public networkStatus: string;

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private themeService: ThemeService,
        private routerService: RouterService,
        private authService: AuthService,
        public userService: UserService,
        private _location: Location,
        public alertController: AlertController,
        public updateAppService: UpdateAppService
       // private ngZone: NgZone,
    ) {

        this.initializeApp();

    }

    // tslint:disable-next-line:use-lifecycle-interface
    ngAfterViewInit(): void {
        this.routerService.init(this.routerOutlet);
    }

    async initializeApp() {
        const user = await this.authService.getUserByToken().pipe().toPromise();
       // this.userService.setUser(user);
       // alert(this.userService.user.id);

        this.platform.ready().then(() => {
          
            if(this.platform.is('android') || this.platform.is('ios')) {
                this.updateAppService.checkForUpdate();
            }
            this.statusBar.styleDefault();
            this.themeService.toggleDarkMode(true);
            this.splashScreen.hide();

            /*Network.addListener('networkStatusChange', (status) => {
                this.ngZone.run(() => {
                    // This code will run in Angular's execution context
                    this.networkStatus = status.connected ? 'Online' : 'Offline';
                    console.log(this.networkStatus);
                });
            });*/
        });

        
        /*this.platform.backButton.subscribeWithPriority(9999, (processNextHandler) => {
           // alert('Back press handler!');

            alert(JSON.stringify(this._location));

            if (this._location.isCurrentPathEqualTo('tabs/highlights')) {
      
              // Show Exit Alert!
              console.log('Show Exit Alert!');
              this.showExitConfirm();
              processNextHandler();
            } else {
      
              // Navigate to back page
              console.log('Navigate to back page');
              this._location.back();
      
            }
          });*/


        // this.themeService.restore();
        this.themeService.toggleDarkMode(true);
    }

    showExitConfirm() {
        this.alertController.create({
          header: '???????? ????????????????',
          message: '?????? ?????? ???????? ?????????? ???? ???????????????????',
          backdropDismiss: false,
          buttons: [{
            text: '???????????? ??????????????????',
            role: 'cancel',
            handler: () => {
              console.log('Application exit prevented!');
            }
          }, {
            text: '??????????',
            handler: () => {
              navigator['app'].exitApp();
            }
          }]
        })
          .then(alert => {
            alert.present();
          });
      }
}
