import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { GraphService } from '../services/graph.service';

@Component({
  selector: 'app-save',
  templateUrl: './save.component.html',
  styleUrls: ['./save.component.css']
})
export class SaveComponent implements OnInit {
  wantSave:boolean = false;
  form: FormGroup;
  error: string = "";

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder,
    private http: HttpClient, private toastr: ToastrService, public graphService: GraphService) { 
    this.form = this.fb.group({
      sessionName: ['', [Validators.required, Validators.pattern("[A-Za-z0-9]*")]],
      description: ['', [Validators.pattern("[A-Za-z0-9 .!?+=,-]*")]]
    }, {});
  }

  ngOnInit(): void {
  }

  save() {
    this.closeModalAndStopSniff(this.form.get("sessionName")?.value, this.form.get("description")?.value);
  }

  closeModalAndStopSniff(sessionName:string = "", description:string = "") {
    var body = {
      sessionName: sessionName,
      description: description
    };
    this.http.post<any>("api/sniff/false" , body, { observe: "response" }).subscribe(result => {
      this.toastr.success(result.body, "Success!");
      console.log(result.body);
      this.graphService.stopGraph();
      this.activeModal.close();
      }, err => {
        if(err.status == 400) {
          this.error = err.error.message
        }
        else {
          this.toastr.error(err.status + " " + err.statusText, 'Error');
        }
        console.log(err);
      });
  }

}
