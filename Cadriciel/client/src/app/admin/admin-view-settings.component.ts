import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-admin-view-settings-component',
    templateUrl: './admin-view-settings.component.html',
    styleUrls: ['./admin-view-settings.component.css']
})
export class AdminViewSettingsComponent implements OnInit {
    public passwordChanged: boolean;

    constructor(private authenticationService: AuthenticationService, private route: ActivatedRoute) { }

    public ngOnInit(): void {
        this.passwordChanged = false;
    }

    public getRoute() {
        return this.route;
    }

    public async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
        await this.authenticationService.changePassword(oldPassword, newPassword).then(res => {
            this.passwordChanged = (res === 'success');
        });
        return await this.passwordChanged;
    }
}
