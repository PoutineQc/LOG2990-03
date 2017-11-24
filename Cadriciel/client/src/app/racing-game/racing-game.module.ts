import { ObstacleCollisionEventService } from './events/obstacle-collision-event.service';
import { CollisionEventService } from './events/collision-event.service';
import { VehicleMovementController } from './vehicle-movement-controller.service';
import { RoadLimitService } from './road-limit.service';
import { RaceService } from './events/race.service';
import { AudioService } from './audio.service';
import { ObstaclePositionService } from './obstacle-position.service';
import { DiamondSquareAlgorithmService } from './diamond-square-algorithm.service';
import { LineCalculationService } from './line-calculation.service';
import { DecorElementsService } from './decor-elements.service';
import { CountdownService } from './countdown.service';
import { TerrainGenerationService } from './terrain-generation.service';
import { RacingGameRoutingModule } from './racing-game-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { GameInitializationModule } from './game-initialization/game-initialization.module';

import { RacingGameComponent } from './racing-game.component';
import { RenderService } from './render.service';
import { CameraService } from './camera.service';
import { TrackService } from './game-initialization/track.service';
import { RacingGameService } from './racing-game.service';
import { CommandsService } from './events/commands.service';
import { VehicleService } from './vehicle.service';
import { CollisionDetectionService } from './collision-detection.service';
import { VehicleMoveEventService } from './events/vehicle-move-event.service';
import { VehicleRotateEventService } from './events/vehicle-rotate-event.service';
import { LoadingProgressEventService } from './events/loading-progress-event.service';
import { ObstacleCollisionDetectionService } from './obstacle-collision-detection.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        BrowserModule,
        HttpModule,
        GameInitializationModule,
        RacingGameRoutingModule
    ],
    declarations: [
        RacingGameComponent,
    ],
    exports: [
        RacingGameComponent,
    ],
    providers: [
        RenderService,
        CameraService,
        TrackService,
        RacingGameService,
        TerrainGenerationService,
        CommandsService,
        VehicleService,
        CountdownService,
        DecorElementsService,
        LineCalculationService,
        DiamondSquareAlgorithmService,
        ObstaclePositionService,
        AudioService,
        RaceService,
        CollisionDetectionService,
        RoadLimitService,
        VehicleMoveEventService,
        VehicleMovementController,
        VehicleRotateEventService,
        LoadingProgressEventService,
        CollisionEventService,
        ObstacleCollisionEventService,
        ObstacleCollisionDetectionService
    ]
})
export class RacingGameModule {
    constructor(collisionDetectionService: CollisionDetectionService) {

    }
}
