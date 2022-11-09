import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { NO_PROCESS_INFO } from '../constants';
import { InfoPanelService } from '../services/info-panel.service';
import { GenericNode, LinkData } from '../interfaces/d3-graph-interfaces';
import { PacketInfo } from '../interfaces/packet-info';
import { Link } from '../interfaces/link';

export interface PacketsAndLinks {
  packets: Array<PacketInfo>,
  links: Array<Link>
}

@Component({
  selector: 'app-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.css']
})
export class InfoPanelComponent implements OnInit {
  isPanelOpen: boolean = true;
  isNodeSelected: boolean = false;
  isLinkSelected: boolean = false;
  isIPNode: boolean = false;
  isNoProcess: boolean = false;
  noProcessInfo = NO_PROCESS_INFO;
  heading0 = "";
  subheading0 = "";
  heading1 = "";
  subheading1 = "";
  timestamp = "";
  totalPackets = -1;
  totalPackets1 = "";
  totalPackets2 = "";

  packets: Array<PacketInfo> = new Array<PacketInfo>();
  links: Array<Link> = new Array<Link>();

  selectedLink?: Link;

  constructor(private infoPanelService:InfoPanelService, private http: HttpClient,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.infoPanelService.toggleInfoPanelEvent.subscribe((isPanelOpen: boolean) => {
      this.isPanelOpen = isPanelOpen;
    });

    this.infoPanelService.updatePanelNodeInfoEvent.subscribe((nodeData: GenericNode) => {
      console.log(nodeData);
      this.isLinkSelected = false;
      this.isNoProcess = false;
      var headings = this.determineHeadingsFromNode(nodeData, true);
      this.heading0 = headings.heading;
      this.subheading0 = headings.subheading;
      this.totalPackets = nodeData.tot_packets;
      this.isPanelOpen = true;
      this.isNodeSelected = true;
      this.getNodePacketInfo(nodeData);
    });

    this.infoPanelService.updatePanelLinkInfoEvent.subscribe((linkData: LinkData) => {
      console.log(linkData);
      this.isNodeSelected = false;
      this.isNoProcess = false;
      var headings = this.determineHeadingsFromNode(linkData.source, false);
      this.heading0 = headings.heading;
      this.subheading0 = headings.subheading;
      this.totalPackets1 = linkData.out_packets + "";
      headings = this.determineHeadingsFromNode(linkData.target, false);
      this.heading1 = headings.heading;
      this.subheading1 = headings.subheading;
      this.totalPackets2 = linkData.in_packets + "";
      this.isLinkSelected = true;
      this.isPanelOpen = true;
      this.getLinkPacketInfo(linkData);
    });
  }

  private determineHeadingsFromNode(node: GenericNode, isNodeSelected: boolean) {
    var heading = "";
    var subheading = "";
    this.packets = [];
    if (node?.program) {
      heading = node.program.name;
      subheading = "socket number: " + node.program.socket;
      this.timestamp = node.program.timestamp;
      if (node.program.name === "no process") {
        subheading = "no associated process";
        this.isNoProcess = true;
      }
      if(isNodeSelected) {
        this.isIPNode = false;
      }
    }
    if (node?.ip && node?.name) {
      heading = node.name !== "no hostname" ? node.name : node.ip;
      subheading = node.name !== "no hostname" ? "ip: " + node.ip : "";
      if(isNodeSelected) {
        this.isIPNode = true;
      }
    }
    return {
      heading: heading,
      subheading: subheading
    }
  }

  private getNodePacketInfo(node: GenericNode) {
    var body = {};
    if(this.isIPNode) {
      body = {
        isIP: true,
        ip: node.ip
      }
    } else {
      body = {
        isIP: false,
        fd: node.program?.fd,
        name: node.program?.name,
        socket: node.program?.socket
      }
    }
    this.http.post<PacketsAndLinks>("api/node_packets" , body, { observe: "response" }).subscribe(result => {
      console.log(result.body);
      this.packets = result.body ? result.body.packets : [];
      this.links = result.body ? result.body.links : [];
      }, err => {
        this.toastr.error(err.status + " " + err.statusText, 'Error');
        console.log(err);
      });
  }

  private getLinkPacketInfo(link: LinkData) {
    var body = {
      ip: link.source.ip ? link.source.ip : link.target.ip,
      fd: link.source.program ? link.source.program.fd : link.target.program?.fd,
      name: link.source.program ? link.source.program.name : link.target.program?.name,
      socket: link.source.program ? link.source.program.socket : link.target.program?.socket
    };
    
    this.http.post<Array<PacketInfo>>("api/link_packets" , body, { observe: "response" }).subscribe(result => {
      console.log(result.body);
      this.packets = result.body ? result.body : [];
      }, err => {
        this.toastr.error(err.status + " " + err.statusText, 'Error');
        console.log(err);
      });
  }

  setLink(link: Link) {
    this.selectedLink = link;
    this.infoPanelService.selectLink(link);
  }

  deselectLink() {
    this.selectedLink = undefined;
    this.infoPanelService.showAllPackets();
  }
  
}
