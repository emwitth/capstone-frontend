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

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder,
    private http: HttpClient, private toastr: ToastrService, public graphService: GraphService) { 
    this.form = this.fb.group({
      sessionName: ['', [Validators.required, Validators.pattern("[A-Za-z0-9]*")]]
    }, {});
  }

  ngOnInit(): void {
  }

  save() {
    console.log(this.form.get("sessionName")?.value);
    this.closeModalAndStopSniff();
  }

  closeModalAndStopSniff() {
    this.activeModal.close();
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

}
