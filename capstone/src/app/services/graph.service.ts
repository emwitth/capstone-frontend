import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GraphService {
  @Output() graphStartEvent = new EventEmitter();
  @Output() graphStopEvent = new EventEmitter();
  @Output() graphUpdateEvent = new EventEmitter();

  constructor() { }

  public startGraph() {
    this.graphStartEvent.emit();
  }

  public stopGraph() {
    this.graphStopEvent.emit();
  }

  public updateGraph() {
    this.graphUpdateEvent.emit();
  }
}
