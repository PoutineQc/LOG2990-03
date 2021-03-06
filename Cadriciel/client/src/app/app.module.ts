import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { APP_BASE_HREF } from '@angular/common';

/* App Root */
// Component imports
import { AppComponent } from './app.component';

// Service imports

/* Feature modules */
import { CrosswordModule } from './crossword-game/crossword.module';
import { HomeModule } from './home/home.module';
import { RacingGameModule } from './racing-game/racing-game.module';
import { AdminModule } from './admin/admin.module';

/* Routing modules */
import { AppRoutingModule } from './app-routing.module';


@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        HttpModule,
        AppRoutingModule,
        CrosswordModule,
        HomeModule,
        RacingGameModule,
        AdminModule
    ],
    providers: [
        { provide: APP_BASE_HREF, useValue: '/' }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
