import { Component, OnInit } from '@angular/core';
import { NO_PROCESS_INFO } from '../constants';
import { InfoPanelService } from '../services/info-panel.service';
import { GenericNode, LinkData } from '../interfaces/d3-graph-interfaces';

export interface info {
  heading: string,
  subheading: string
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
  heading0 = "";
  subheading0 = "";
  heading1 = "";
  subheading1 = "";
  timestamp = "";
  totalPackets = -1;

  constructor(private infoPanelService:InfoPanelService) { }

  ngOnInit(): void {
    this.infoPanelService.toggleInfoPanelEvent.subscribe((isPanelOpen: boolean) => {
      this.isPanelOpen = isPanelOpen;
    });

    this.infoPanelService.updatePanelNodeInfoEvent.subscribe((nodeData: GenericNode) => {
      console.log(nodeData);
      this.isLinkSelected = false;
      var headings = this.determineHeadingsFromNode(nodeData, true);
      this.heading0 = headings.heading;
      this.subheading0 = headings.subheading;
      this.totalPackets = nodeData.tot_packets;
      this.isPanelOpen = true;
      this.isNodeSelected = true;
    });

    this.infoPanelService.updatePanelLinkInfoEvent.subscribe((linkData: LinkData) => {
      console.log(linkData);
      this.isNodeSelected = false;
      var headings = this.determineHeadingsFromNode(linkData.source, false);
      this.heading0 = headings.heading;
      this.subheading0 = headings.subheading;
      headings = this.determineHeadingsFromNode(linkData.target, false);
      this.heading1 = headings.heading;
      this.subheading1 = headings.subheading;
      this.isLinkSelected = true;
      this.isPanelOpen = true;
    });
  }

  private determineHeadingsFromNode(node: GenericNode, isNodeSelected: boolean) {
    var heading = "";
    var subheading = "";
    if (node?.program) {
      heading = node.program.name;
      subheading = "socket number: " + node.program.socket;
      this.timestamp = node.program.timestamp;
      if (node.program.name === "no process") {
        subheading = NO_PROCESS_INFO;
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
  
}
