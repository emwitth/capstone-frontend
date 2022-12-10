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
    port: "string",
    program_name: "string",
    program_fd: "string",
    hex: "string"
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
      // if all links selected
      this.infoPanelService.showAllPacketsEvent.subscribe(() => {
        this.isNotHidden = true;
      });
      // if some particular links to ip node selected
      this.infoPanelService.ipNodeLinkSelectedEvent.subscribe((link: Link) => {
        if(
        (link.ip === this.packetInfo.src || link.ip === this.packetInfo.dest) &&
        (link.program.port === this.packetInfo.port)) {
          this.isNotHidden = true;
        }
        else {
          this.isNotHidden = false;
        }
      });
      // if some particular links to prog node selected
      this.infoPanelService.progNodeLinkSelectedEvent.subscribe((link: Link) => {
        console.log(link);
        console.log(this.packetInfo);
        if(link.program.name == this.packetInfo.program_name && link.program.fd == this.packetInfo.program_fd) {
          this.isNotHidden = true;
        }
        else {
          this.isNotHidden = false;
        }
      });
    }
  }

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
