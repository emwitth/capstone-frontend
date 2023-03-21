import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { GraphJSON } from './../interfaces/d3-graph-interfaces';
import { GraphService } from '../services/graph.service';

@Component({
  selector: 'app-hidden-items-list',
  templateUrl: './hidden-items-list.component.html',
  styleUrls: ['./hidden-items-list.component.css']
})
export class HiddenItemsListComponent implements OnInit {
  hiddenItems: GraphJSON  = {
    prog_nodes: [],
    ip_nodes: [],
    links: []
  }

  constructor(public activeModal: NgbActiveModal, private http: HttpClient,
    private toastr: ToastrService, private graphService:GraphService) { }

  ngOnInit(): void {
    this.http.get<GraphJSON>("api/hidden_items" , { observe: "response" }).subscribe(result => {
      console.log(result.body);
      this.hiddenItems = result.body ? result.body : this.hiddenItems;
      }, err => {
        this.toastr.error(err.status + " " + err.statusText, "Error!");
        console.log(err);
      });
  }

  showItem(item: any) {
    var body = {};
    if(item.program && item.ip) {
      body = {
        type: "link",
        prog_name: item.program.name,
        port: item.program.port,
        fd: item.program.fd,
        ip_name: item.ip_name,
        ip: item.ip
      };
    }
    else if(item.program){
      body = {
        type: "program",
        prog_name: item.program.name,
        port: item.program.port,
        fd: item.program.fd
      };
    }
    else if(item.ip) {
      body = {
        type: "ip",
        ip: item.ip
      };
    }
    this.http.post<GraphJSON>("api/show" , body, { observe: "response" }).subscribe(result => {
      console.log(result.body);
      this.graphService.updateGraph();
      this.hiddenItems = result.body ? result.body : this.hiddenItems;
    }, err => {
      this.toastr.error(err.status + " " + err.statusText, 'Error');
      console.log(err);
    });
  }

}
