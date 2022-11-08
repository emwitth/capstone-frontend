import { Component, OnInit, Input } from '@angular/core';
import { PacketInfo } from '../interfaces/packet-info';
import { InfoPanelService } from '../services/info-panel.service';
import { Link } from '../interfaces/link';

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
    dest_name: "string",
    port: "string"
  };
  isExpanded: boolean = false;
  isSrcLocalhost: boolean = false;
  isDestLocalhost: boolean = false;
  isNotHidden: boolean = true;

  constructor(private infoPanelService: InfoPanelService) { }

  ngOnInit(): void {
    if(this.packetInfo.dest_name === "localhost") {
      this.isSrcLocalhost = true;
    }
    else if(this.packetInfo.src_name === "localhost") {
      this.isDestLocalhost = true;
    }
    {
      this.infoPanelService.showAllPacketsEvent.subscribe(() => {
        this.isNotHidden = true;
      });
      this.infoPanelService.linkSelectedEvent.subscribe((link: Link) => {
        if(
        (link.ip === this.packetInfo.src || link.ip === this.packetInfo.dest) &&
        (link.program.socket === this.packetInfo.port)) {
          this.isNotHidden = true;
        }
        else {
          this.isNotHidden = false;
        }
      });
    }
  }

  // private progEquals(program: prog) {

  // }

  setOpenClass() {
    if(this.isExpanded) {
      if(this.isSrcLocalhost) {
        return "info-top-open-src-localhost";
      }
      else if(this.isDestLocalhost) {
        return "info-top-open-dest-localhost";
      }
      else {
        return "info-top-open";
      }
    }
    else {
      if(this.isSrcLocalhost) {
        return "info-top-closed-src-localhost";
      }
      else if(this.isDestLocalhost) {
        return "info-top-closed-dest-localhost";
      }
      else {
        return "info-top-closed";
      }
    }
  }

    setBorderClass() {
      if(this.isSrcLocalhost) {
        return "info-panel-border-src-localhost";
      }
      else if(this.isDestLocalhost) {
        return "info-panel-border-dest-localhost";
      }
      else {
        return "info-panel-border";
      }
  }

}
