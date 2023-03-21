import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { GraphJSON } from '../interfaces/d3-graph-interfaces';

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

  constructor(private http: HttpClient,private toastr: ToastrService) { }

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
    this.unhideNoProcNodeIfHidden()
    this.isProcNodeMinimized = false;
    this.isProcNodeHidden = false;
    this.updateGraph();
  }

  public minNoProcNode() {
    this.unhideNoProcNodeIfHidden()
    this.isProcNodeMinimized = true;
    this.isProcNodeHidden = false;
    this.updateGraph();
  }

  public hideNoProcNode() {
    var body = {
      type: "program",
      prog_name: "no process",
      port: "no port",
      fd: "no process"
    };
    this.http.post<any>("api/hide" , body, { observe: "response" }).subscribe(result => {
      console.log(result.body);
      this.updateGraph();
      this.isProcNodeMinimized = false;
      this.isProcNodeHidden = true;
    }, err => {
      this.toastr.error(err.status + " " + err.statusText, 'Error');
      console.log(err);
    });
  }

  private unhideNoProcNodeIfHidden() {
    if(this.isProcNodeHidden) {
      this.unhideNoProcNode();
    }
  }

  private unhideNoProcNode(){
    var body = {
      type: "program",
      prog_name: "no process",
      port: "no port",
      fd: "no process"
    }; 
    this.http.post<GraphJSON>("api/show" , body, { observe: "response" }).subscribe(result => {
      console.log(result.body);
      this.updateGraph();
    }, err => {
      this.toastr.error(err.status + " " + err.statusText, 'Error');
      console.log(err);
    });
  }
}
