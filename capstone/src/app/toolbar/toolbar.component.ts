import { Component, OnInit } from '@angular/core';
import {Title} from "@angular/platform-browser";
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { StartGraphService } from '../services/start-graph.service';
import { StopGraphService } from '../services/stop-graph.service';
import { InfoPanelService } from '../services/info-panel.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  constructor(private http: HttpClient, private toastr: ToastrService, 
    private startGraphService: StartGraphService, private stopGraphService: StopGraphService,
    private infoPanelService:InfoPanelService, private titleService:Title) {
      this.titleService.setTitle("Remora Fish");
    }

  ngOnInit(): void {
  }

  public startSniff() {
    var body = {};
    this.http.post<any>("api/sniff/true" , body, { observe: "response" }).subscribe(result => {
      this.toastr.success(result.body, "Success!");
      console.log(result.body);
      this.startGraphService.startGraph();
      }, err => {
        this.toastr.error(err.status + " " + err.statusText, "Error!");
        console.log(err);
      });
  }

  public stopSniff() {
    var body = {};
    this.http.post<any>("api/sniff/false" , body, { observe: "response" }).subscribe(result => {
      this.toastr.success(result.body, "Success!");
      console.log(result.body);
      this.stopGraphService.stopGraph();
      }, err => {
        this.toastr.error(err.status + " " + err.statusText, 'Error');
        this.stopGraphService.stopGraph();
        console.log(err);
      });
  }

  public toggleInfoPanel() {
    this.infoPanelService.toggleInfoPanel();
  }

}
