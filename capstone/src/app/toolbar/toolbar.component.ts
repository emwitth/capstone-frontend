import { SaveComponent } from './../save/save.component';
import { Component, OnInit } from '@angular/core';
import {Title} from "@angular/platform-browser";
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GraphService } from '../services/graph.service';
import { InfoPanelService } from '../services/info-panel.service';
import { HiddenItemsListComponent } from '../hidden-items-list/hidden-items-list.component';
import { SessionListComponent } from '../session-list/session-list.component';


@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  isSniffing:boolean = false;

  constructor(private http: HttpClient, private toastr: ToastrService, 
    public graphService: GraphService, private modalService: NgbModal,
    private infoPanelService:InfoPanelService, private titleService:Title) {
      this.titleService.setTitle("Remora Fish");
    }

  ngOnInit(): void {
    this.graphService.graphStopEvent.subscribe(() => {
      this.isSniffing = false;
    });
  }

  public startSniff() {
    if(this.isSniffing) {
      return;
    }

    var body = {};
    this.http.post<any>("api/sniff/true" , body, { observe: "response" }).subscribe(result => {
      this.toastr.success(result.body, "Success!");
      console.log(result.body);
      this.graphService.startGraph();
      this.isSniffing = true;
      }, err => {
        this.toastr.error(err.status + " " + err.statusText, "Error!");
        console.log(err);
      });
  }

  public stopSniff() {
    if (!this.isSniffing) {
      return;
    }

    const modalRef = this.modalService.open(
      SaveComponent, { modalDialogClass: 'theme-modal'});
    modalRef.result
  }

  public toggleInfoPanel() {
    this.infoPanelService.toggleInfoPanel();
  }

  public openHiddenItemsList() {
    const modalRef = this.modalService.open(
      HiddenItemsListComponent,
      { size: 'xl', modalDialogClass: 'theme-modal'});
  }

  public openSessionList() {
    const modalRef = this.modalService.open(
      SessionListComponent,
      {modalDialogClass: 'theme-modal'});
  }

  public getNoProcNodeDropdownClass() {
    if (this.graphService.isProcNodeHidden) {
      return "bi bi-eye-slash-fill";
    }
    else if (this.graphService.isProcNodeMinimized) {
      return "bi bi-dash-circle-fill";
    }
    else {
      return "bi bi-eye-fill";
    }
  }

}
