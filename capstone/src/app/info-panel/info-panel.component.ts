import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { NO_PROCESS_INFO, NON_PROG_NODE_TYPES } from '../constants';
import { InfoPanelService } from '../services/info-panel.service';
import { GenericNode, LinkData } from '../interfaces/d3-graph-interfaces';
import { PacketInfo } from '../interfaces/packet-info';
import { Link } from '../interfaces/link';
import { GraphService } from '../services/graph.service';

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
  isCustomNode: boolean = false;
  isIPNode: boolean = false;
  isNoProcess: boolean = false;
  isPacketInfoLoading: boolean = false;
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

  currentNode: GenericNode = {
    tot_packets: -1,
    program: {
      name: "string",
      port: "string",
      fd: "string",
      timestamp: "string"
    },
    names: ["string"],
    ip: "string",
    x: -1,
    y: -1
  };

  currentLink: LinkData = {
  source: {
    tot_packets: -1,
    program: {
      name: "string",
      port: "string",
      fd: "string",
      timestamp: "string"
    },
    names: ["string"],
    ip: "string",
    x: -1,
    y: -1
  },
  target: {
    tot_packets: -1,
    program: {
      name: "string",
      port: "string",
      fd: "string",
      timestamp: "string"
    },
    names: ["string"],
    ip: "string",
    x: -1,
    y: -1
  },
  in_packets: -1,
  out_packets: -1
  }

  constructor(private infoPanelService:InfoPanelService, private http: HttpClient,
    private toastr: ToastrService, private graphService: GraphService) { }

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
      this.currentNode = nodeData;
      this.deselectAllInDropdown();
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
      this.currentLink = linkData;
      this.getLinkPacketInfo(linkData);
    });
  }

  private determineHeadingsFromNode(node: GenericNode, isNodeSelected: boolean) {
    var heading = "";
    var subheading = "";
    this.packets = [];
    this.isCustomNode = false;
    if (node?.program) {
      this.determineSpecialNode(node)
      heading = node.program.name;
      subheading = "port: " + node.program.port;
      this.timestamp = node.program.timestamp;
      if (node.program.name === "no process") {
        subheading = "no associated process";
        this.isNoProcess = true;
      }
      if(this.isCustomNode) {
        subheading = node.program.name ? node.program.name : "";
      }
      if(isNodeSelected) {
        this.isIPNode = false;
      }
    }
    if (node?.ip && node?.names) {
      if(node.names.length > 1) {
        heading = node.ip;
        var first = true;
        node.names.every(name => {
          if(name !== "no hostname") {
            if(first) {
              heading = "";
              first = false;
            }
            else {
              heading += ", ";
            }
            if(heading.length >= 50) {
              heading += "...";
              return false;
            }
            else {
              heading += name;
            }
          }
          return true;
        })
        subheading = heading !== node.ip ? "ip: " + node.ip : "";
        console.log(subheading)
      }
      else {
        heading = node.names[0] !== "no hostname" ? node.names[0] : node.ip;
        subheading = node.names[0] !== "no hostname" ? "ip: " + node.ip : "";
      }
      if(isNodeSelected) {
        this.isIPNode = true;
      }
    }
    return {
      heading: heading,
      subheading: subheading
    }
  }

  private determineSpecialNode(node: GenericNode) {
    NON_PROG_NODE_TYPES.forEach((type: String) => {
      if(node?.program?.name == type) {
        this.isCustomNode = true;
      }
    });
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
        port: node.program?.port
      }
    }
    this.isPacketInfoLoading = true;
    this.http.post<PacketsAndLinks>("api/node_packets" , body, { observe: "response" }).subscribe(result => {
      console.log(result.body);
      this.isPacketInfoLoading = false;
      this.packets = result.body ? result.body.packets : [];
      this.links = result.body ? result.body.links : [];
    }, err => {
      this.isPacketInfoLoading = false;
      this.toastr.error(err.status + " " + err.statusText, 'Error');
      console.log(err);
    });
  }

  private getLinkPacketInfo(link: LinkData) {
    var body = {
      ip: link.source.ip ? link.source.ip : link.target.ip,
      fd: link.source.program ? link.source.program.fd : link.target.program?.fd,
      name: link.source.program ? link.source.program.name : link.target.program?.name,
      port: link.source.program ? link.source.program.port : link.target.program?.port
    };
    this.isPacketInfoLoading = true;
    this.http.post<Array<PacketInfo>>("api/link_packets" , body, { observe: "response" }).subscribe(result => {
      console.log(result.body);
      this.isPacketInfoLoading = false;
      this.packets = result.body ? result.body : [];
    }, err => {
      this.isPacketInfoLoading = false;
      this.toastr.error(err.status + " " + err.statusText, 'Error');
      console.log(err);
    });
  }

  setLinkInDropdown(link: Link) {
    this.selectedLink = link;
    if(!this.isIPNode)
    {
      this.infoPanelService.selectIpNodeInDropdown(link);
    }
    else
    {
      this.infoPanelService.selectProgNodeInDropdown(link);
    }
  }

  deselectAllInDropdown() {
    this.selectedLink = undefined;
    this.infoPanelService.showAllPackets();
  }

  hideNode() {
    var body = {};
    if(this.currentNode.ip && this.currentNode.names) {
      body = {
        type: "ip",
        ip_name: this.currentNode.names,
        ip: this.currentNode.ip
      };
    } else if (this.currentNode.program) {
      body = {
        type: "program",
        prog_name: this.currentNode.program.name,
        port: this.currentNode.program.port,
        fd: this.currentNode.program.fd
      }
    }
    this.http.post<any>("api/hide" , body, { observe: "response" }).subscribe(result => {
      console.log(result.body);
      this.graphService.updateGraph()
    }, err => {
      this.toastr.error(err.status + " " + err.statusText, 'Error');
      console.log(err);
    });
  }

  hideLink() {
    var progNode: GenericNode;
    var ipNode: GenericNode;
    if(this.currentLink.source.program) {
      progNode = this.currentLink.source;
      ipNode = this.currentLink.target;
    } 
    else {
      progNode = this.currentLink.target;
      ipNode = this.currentLink.source;
    }
    var body = {
      type: "link",
      prog_name: progNode.program?.name,
      port: progNode.program?.port,
      fd: progNode.program?.fd,
      ip_name: ipNode.names,
      ip: ipNode.ip
    };
    this.http.post<any>("api/hide", body, { observe: "response" }).subscribe(result => {
      console.log(result.body);
      this.graphService.updateGraph()
    }, err => {
      this.toastr.error(err.status + " " + err.statusText, 'Error');
      console.log(err);
    });
  }
  
}
