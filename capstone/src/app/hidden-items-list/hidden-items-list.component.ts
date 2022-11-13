import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { GraphJSON } from './../interfaces/d3-graph-interfaces';

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
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.http.get<GraphJSON>("api/hidden_items" , { observe: "response" }).subscribe(result => {
      console.log(result.body);
      this.hiddenItems = result.body ? result.body : this.hiddenItems;
      }, err => {
        this.toastr.error(err.status + " " + err.statusText, "Error!");
        console.log(err);
      });
  }

}
