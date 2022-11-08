import { Component, OnInit, Input } from '@angular/core';
import { PacketInfo } from '../interfaces/packet-info';

@Component({
  selector: 'app-packet-info-display',
  templateUrl: './packet-info-display.component.html',
  styleUrls: ['./packet-info-display.component.css']
})
export class PacketInfoDisplayComponent implements OnInit {
  @Input() packetInfo:PacketInfo = {
    summary: "string",
    src: "string",
    dest: "string",
    src_name: "string",
    dest_name: "string"
  };
  isSummaryLong: boolean = false;
  truncatedSummary: string = "";
  isExpanded: boolean = false;
  packetInfoHeaderClasses = [
    "info-top-closed",
    "info-top-open"
  ];

  constructor() { }

  ngOnInit(): void {
    if(this.packetInfo.summary.length > 55) {
      this.truncatedSummary = this.packetInfo.summary.substring(0,55) + "...";
      this.isSummaryLong = true;
    }
  }

  setOpenClass() {
    if(this.isExpanded) {
      return this.packetInfoHeaderClasses[1];
    }
    else {
      return this.packetInfoHeaderClasses[0];
    }
  }

}
