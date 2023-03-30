import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Session } from '../interfaces/sessions';

@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css']
})
export class SessionListComponent implements OnInit {
  sessions: Array<Session>  = []

  constructor(private toastr: ToastrService, private http:HttpClient) { }

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
    this.http.delete<any>("api/sessions/" + name , { observe: "response" }).subscribe(result => {
      console.log(result.body);
      this.toastr.success(result.body);
      this.loadSessions();
    }, err => {
      this.toastr.error(err.status + " " + err.statusText, "Error!");
      console.log(err);
    });
    this.loadSessions();
  }

}
