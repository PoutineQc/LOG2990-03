import { ObstacleService } from './obstacle.service';
import { CommandsService } from './commands.service';
import { Track } from './track';
import { VehicleService } from './vehicle.service';
import { TestBed } from '@angular/core/testing';
import * as THREE from 'three';

let vehicleService: VehicleService;
const track = new Track('name', 'description', 'type', [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(100, 0),
    new THREE.Vector2(100, 100)
], [], [], []);

describe('VehicleService', () => {
    beforeEach(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [VehicleService, CommandsService, ObstacleService]
        });
        vehicleService = TestBed.get(VehicleService);
    });

    it('should be created', () => {
        expect(vehicleService).toBeTruthy();
    });

    it('Should initialize main 3D vehicle', (done) => {
        vehicleService.initializeMainVehicle(track, 1).then(function(data) {
            expect(data).toBeDefined();
            done();
        });
    });

    it('Should initialize opponents 3D vehicles(3)', (done) => {
        vehicleService.initializeOpponentsVehicles(track, 1).then(function(data) {
            expect(data).toBeDefined();
            done();
        });
    });

});

