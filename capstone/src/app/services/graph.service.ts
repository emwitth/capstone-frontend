import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

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
    this.isProcNodeMinimized = false;
    this.isProcNodeHidden = false;
  }

  public minNoProcNode() {
    this.isProcNodeMinimized = true;
    this.isProcNodeHidden = false;
  }

  public hideNoProcNode() {
    var body = {
      type: "ip",
      ip_name: "no hostname",
      ip: "no ip"
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
}
