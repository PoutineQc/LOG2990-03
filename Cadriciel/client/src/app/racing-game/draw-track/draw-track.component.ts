import { ActivatedRoute } from '@angular/router';
import { AfterViewInit, Component, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core';
import { DrawTrackService } from './draw-track.service';

@Component({
    moduleId: module.id,
    selector: 'app-draw-track-component',
    templateUrl: './draw-track.component.html',
    styleUrls: ['./draw-track.component.css']
})

export class DrawTrackComponent implements AfterViewInit, OnInit {
    public name: string;
    public description: string;
    public difficulty: string;

    public saveEnabled = false;

    constructor(private trackService: DrawTrackService, private route: ActivatedRoute) {
    }

    private get container(): HTMLDivElement {
        return this.containerRef.nativeElement;
    }

    @ViewChild('container')
    private containerRef: ElementRef;

    @HostListener('window:resize', ['$event'])
    public onResize() {
        this.trackService.onResize();
    }

    public ngOnInit() {
        if (this.route.snapshot.url[this.route.snapshot.url.length - 2].path === 'edit') {
            this.name = this.route.snapshot.params['name'];
            this.trackService.loadTrack(this.route.snapshot.params['name']).then(response => {
                this.description = response.description;
                this.difficulty = response.difficulty;
            });
        }
    }

    public updateMousePosition(event: MouseEvent): void {
        this.trackService.updateMousePosition(event.clientX, event.clientY);
    }

    public addIntersection(event: MouseEvent): void {
        this.trackService.addIntersection();
        this.saveEnabled = this.trackService.isFinished();
    }

    public removeIntersection(event: MouseEvent): void {
        this.trackService.removeIntersection();
        this.saveEnabled = false;
    }

    public startDrag(event: MouseEvent): void {
        this.trackService.startDrag();
    }

    public endDrag(event: MouseEvent): void {
        this.trackService.endDrag();
    }

    public ngAfterViewInit() {
        this.trackService.initialise(this.container);
    }

    public addObstacle(type: number) {
        this.trackService.addObstacle(type);
    }

    public randomizePosition(type: number) {
        this.trackService.randomizeAllPositions(type);
    }

    public saveTrack() {
        if (this.saveEnabled) {
            this.trackService.saveTrack(this.name, this.description, this.difficulty);
        }
    }
}
