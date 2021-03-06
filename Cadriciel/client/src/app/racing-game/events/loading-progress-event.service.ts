import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';

export class LoadingProgressEvent {
    constructor(
        private progress: string,
        private object: any
    ) { }

    public getProgress(): string {
        return this.progress;
    }

    public getObject(): any {
        return this.object;
    }
}

@Injectable()
export class LoadingProgressEventService {

    private eventListener = new Subject<LoadingProgressEvent>();

    public sentLoadingEvent(event: LoadingProgressEvent): void {
        this.eventListener.next(event);
    }

    public getLoadingObservable(): Observable<LoadingProgressEvent> {
        return this.eventListener.asObservable();
    }
}
