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

  constructor() { }

  ngOnInit(): void {
  }

}
