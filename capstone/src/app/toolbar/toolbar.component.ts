import { Component, OnInit } from '@angular/core';
import {Title} from "@angular/platform-browser";
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GraphService } from '../services/graph.service';
import { InfoPanelService } from '../services/info-panel.service';
import { HiddenItemsListComponent } from '../hidden-items-list/hidden-items-list.component';


@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  constructor(private http: HttpClient, private toastr: ToastrService, 
    private graphService: GraphService, private modalService: NgbModal,
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
      this.graphService.startGraph();
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
      this.graphService.stopGraph();
      }, err => {
        this.toastr.error(err.status + " " + err.statusText, 'Error');
        this.graphService.stopGraph();
        console.log(err);
      });
  }

  public toggleInfoPanel() {
    this.infoPanelService.toggleInfoPanel();
  }

  public openHiddenItemsList() {
    const modalRef = this.modalService.open(
      HiddenItemsListComponent,
      { size: 'xl', modalDialogClass: 'theme-modal'});
  }

}
