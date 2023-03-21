import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GraphService {
  @Output() graphStartEvent = new EventEmitter();
  @Output() graphStopEvent = new EventEmitter();
  @Output() graphUpdateEvent = new EventEmitter();

  SHOW_NO_PROC_NODE:string = "Show full 'no process' node"
  MIN_NO_PROC_NODE:string = "Minimize 'no process' node"
  HIDE_NO_PROC_NODE:string = "Hide 'no process' node"
  isProcNodeMinimized:boolean = true;
  isProcNodeHidden:boolean = false;

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

  public showNoProcNode() {
    this.isProcNodeMinimized = false;
    this.isProcNodeHidden = false;
  }

  public minNoProcNode() {
    this.isProcNodeMinimized = true;
    this.isProcNodeHidden = false;
  }

  public hideNoProcNode() {
    this.isProcNodeMinimized = false;
    this.isProcNodeHidden = true;
  }
}
