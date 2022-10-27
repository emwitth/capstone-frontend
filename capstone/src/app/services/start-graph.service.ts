import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StartGraphService {
  @Output() graphStartEvent = new EventEmitter();

  constructor() { }

  public startGraph() {
    this.graphStartEvent.emit();
  }
}
