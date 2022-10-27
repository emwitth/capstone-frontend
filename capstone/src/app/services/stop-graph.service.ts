import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StopGraphService {
  @Output() graphStopEvent = new EventEmitter();

  constructor() { }

  public stopGraph() {
    this.graphStopEvent.emit();
  }
}
