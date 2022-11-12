import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-hidden-items-list',
  templateUrl: './hidden-items-list.component.html',
  styleUrls: ['./hidden-items-list.component.css']
})
export class HiddenItemsListComponent implements OnInit {
  constructor(public activeModal: NgbActiveModal, private http: HttpClient,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.http.get<any>("api/hidden_items" , { observe: "response" }).subscribe(result => {
      console.log(result.body);
      }, err => {
        this.toastr.error(err.status + " " + err.statusText, "Error!");
        console.log(err);
      });
  }

}
