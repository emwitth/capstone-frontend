import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Session } from '../interfaces/sessions';
import * as FileSaver from 'file-saver';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css']
})
export class SessionListComponent implements OnInit {
  sessions: Array<Session>  = []

  constructor(private toastr: ToastrService, private http:HttpClient,
    public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions() {
    this.http.get<Array<Session>>("api/sessions" , { observe: "response" }).subscribe(result => {
      console.log(result.body);
      this.sessions = result.body ? result.body : [];
    }, err => {
      this.toastr.error(err.status + " " + err.statusText, "Error!");
      console.log(err);
    });
  }

  delete(name:string) {
    console.log(name)
    this.http.delete<any>("api/sessions/" + name, { observe: "response" }).subscribe(result => {
      console.log(result.body);
      this.toastr.success(result.body);
      this.loadSessions();
    }, err => {
      this.toastr.error(err.status + " " + err.statusText, "Error!");
      console.log(err);
    });
    this.loadSessions();
  }

  getPcap(name:string) {
    console.log(name)
    this.http.post("api/sessions/" + name + "/pcap", {}, { responseType: 'blob' }).subscribe(result => {
      console.log(result);
      if(result) {
        FileSaver.saveAs(result, name+".pcap");
      }
      else {
        this.toastr.error("Something went wrong! File is null");
      }
    }, err => {
      this.toastr.error(err.status + " " + err.statusText, "Error!");
      console.log(err);
    });
  }

  loadSession(name:string) {
    console.log(name)
    this.http.post<any>("api/sessions/" + name, {}, { observe: "response" }).subscribe(result => {
      this.toastr.success(result.body);
      this.activeModal.close();
    }, err => {
      this.toastr.error(err.status + " " + err.statusText, "Error!");
      console.log(err);
    });
  }

}
