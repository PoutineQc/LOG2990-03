import { Track } from './../track';
import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

const apiUrl = 'http://localhost:3000/api';
const headers = new Headers({ 'Content-Type': 'application/json' });
const getPath = 'track';
const getAllPath = 'tracks';
const savePath = 'track';
const deletePath = 'track';

@Injectable()
export class TrackService {
    constructor(private http: Http) { }

    public save(track: Track): Promise<string> {
        return this.http
            .post(`${apiUrl}/${savePath}`, JSON.stringify(track), {headers: headers} ).toPromise()
            .then(response => response.json().data)
            .catch(this.handleError);
    }

    public delete(trackName: string): Promise<string> {
        return this.http
            .delete(`${apiUrl}/${deletePath}/${trackName}`).toPromise()
            .then(response => response.json().data)
            .catch(this.handleError);
    }

    public get(trackName: string): Promise<Track> {
        return this.http
            .get(`${apiUrl}/${getPath}/${trackName}`).toPromise()
            .then(response => {
                const track = response.json();
                return new Track(
                    trackName,
                    track.description,
                    track.type,
                    track.trackIntersections,
                    track.puddles,
                    track.potholes,
                    track.boosters,
                    track.rating,
                    track.numberOfTimesPlayed,
                    track.bestTimes,

                );
            })
            .catch(this.handleError);
    }

    public getAll(): Promise<string[]> {
        return this.http
            .get(`${apiUrl}/${getAllPath}`).toPromise()
            .then(response => {
                return response.json();
            })
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}

