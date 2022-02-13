import {Injectable} from '@angular/core';
import {Capacitor} from '@capacitor/core';
import {Router} from '@angular/router';
import {
    ActionPerformed,
    PushNotificationSchema,
    PushNotifications,
    Token,
  } from '@capacitor/push-notifications';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {UserService} from '../user/user.service';
import {AngularFirestore} from '@angular/fire/firestore';
import {take} from 'rxjs/operators';
import {SettingsService} from '../user/settings/settings.service';
import { ParamsService } from '../params/params.service';


@Injectable({
    providedIn: 'root'
})
export class FcmService {

    public data;
    public options;

    constructor(private router: Router, public db: AngularFirestore, public userService: UserService,
                public http: HttpClient, public settingsService: SettingsService, public paramsService: ParamsService
    ) {}

    public getOptionsByUserId(id) {
        this.settingsService.getByUserId(id).subscribe(
            options => {
                this.options = options
            }
        );
    }

    public initPush() {
        if (Capacitor.getPlatform() !== 'web') {
            this.registerPush();
        }
    }

    lastTimeUsageByUserId(id) {
        this.db.collection('push', ref => ref
            .where('user_id', '==', id))
            .get().subscribe(res => {
        });
    }


    // How many times user would receive notification
    // Ex. once a day
    public frequency(time) {
        const result = new Date(time);
        result.setDate(result.getDate() + 1);
        const currentTime = new Date().getTime();
        return +result <= currentTime;
    }

    public setToken(id) {
        // Minus one day in order to get push today
        const time = Date.now() - 86400000;

        const data = {user_id: this.userService.getId(), token: id, lastTimeUse: time};

        try {
            this.db.collection('push', ref => ref
                .where('token', '==', data.token)
                .where('user_id', '==', data.user_id))
                .get().subscribe(res => {
                if (res.empty) {
                    this.db.collection('push').add(data);
                }
            });
        } catch (e) {
            console.log(JSON.stringify(e.message));
        }
    }

    public resetBadgeCount() {
        PushNotifications.removeAllDeliveredNotifications();
    }

    sendPushMessage(data) {
        try {
            this.data = data;

            console.log(data);


            this.db.collection('push', ref => ref
                .where('user_id', '==', data.receiver?.id ? data.receiver.id : data.receiver_id))
                .snapshotChanges().pipe(take(1)).subscribe(changes => {

                changes.map((a: any) => {
                    const id = a.payload.doc?.id;

                    //if (this.frequency(a.payload.doc.data().lastTimeUse) && this.options.push.active && this.options.push.messages) {
                        console.log('tiken: ' + a.payload.doc.data().token);
                        this.exec(a.payload.doc.data().token);
                        this.db.collection('push').doc(id).set({
                            lastTimeUse: Date.now()
                        },{merge: true});
                    //}
                });
            });
        } catch (e) {
            console.error(e.message)
        }
    }

    public exec(token) {
        const newBody = {
            notification: {
                title: this.data.title,
                body: this.data.body,
                sound: 'default',
                icon: 'fcm_push_icon'
            },
            data: {
                page: this.data.page,
                receiver: this.data.receiver || '',
                sender: this.data.sender || '',
                modal: this.data.modal
            },
            to: token,
            message_id: 111,
            // tslint:disable-next-line:max-line-length
            // to: 'fQZM3BqTS52qtsQPRPSvVk:APA91bFnI_2cQ5V9rhRPt2ZKEwKp7LEtuY18eNajfMAJOsecpXDzBdVtW0H07yNQEgLDCDyGZk98D4c176b28x6-uNub29tGFQJM63MRgfjbFt9NdCA-1F9EY8iRYDi_xmgtin7yMH69',
            priority: 'high',
            restricted_package_name: '',
            time_to_live: 600
        };

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: 'key=AAAAvmQRgho:APA91bGPZFxwrmOMr2SYMfJn4AtSJLdbwrRQLUGTWSJ75oM9DpPfEJVps2isQ86RZ1GTP3yhieVAelkogSf08W3qODWs1gEUOmtLLiAESn-vsJq7m_FW6CctrW9sOLdTlFMseplxEpQ3'
            })
        };

        this.http.post('https://fcm.googleapis.com/fcm/send', newBody, httpOptions).subscribe(res => console.log(res),err => console.error(err));
    }

    private registerPush() {
        PushNotifications.requestPermissions().then((result) => {
            if (result.receive === 'granted') {
                PushNotifications.register();
            }
        });
        
        // On success, we should be able to receive notifications
        PushNotifications.addListener('registration',
            (token: Token) => {
                // token.value
                this.setToken(token.value);
            }
        );

        // Some issue with our setup and push will not work
        PushNotifications.addListener('registrationError',
            (error: any) => {
                console.log('Error on registration: ' + JSON.stringify(error));
            }
        );

        // Show us the notification payload if the app is open on our device
        PushNotifications.addListener('pushNotificationReceived',
            async (notification: PushNotificationSchema) => {
                console.log('Push received: ' + JSON.stringify(notification));
            }
        );

        // Method called when tapping on a notification
        PushNotifications.addListener(
            'pushNotificationActionPerformed',
            async (notification: ActionPerformed) => {
                 const data = notification.notification.data;
                 data.sender = JSON.parse(data.sender);
                 this.paramsService.set(data);
                this.router.navigateByUrl(data.page).then(_ => {});
            }
        );
    }
}



