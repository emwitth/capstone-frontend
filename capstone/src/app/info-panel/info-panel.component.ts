import { Component, OnInit } from '@angular/core';
import { NO_PROCESS_INFO } from '../constants';
import { InfoPanelService } from '../services/info-panel.service';
import { GenericNode } from '../interfaces/d3-graph-interfaces';

@Component({
  selector: 'app-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.css']
})
export class InfoPanelComponent implements OnInit {
  isPanelOpen: boolean = true;
  isNodeSelected: boolean = false;
  isIPNode: boolean = false;
  heading = "";
  subHeading = "";
  timestamp = "";
  totalPackets = -1;

  constructor(private infoPanelService:InfoPanelService) { }

  ngOnInit(): void {
    this.infoPanelService.toggleInfoPanelEvent.subscribe((isPanelOpen: boolean) => {
      this.isPanelOpen = isPanelOpen;
    });

    this.infoPanelService.updatePanelInfoEvent.subscribe((nodeData: GenericNode) => {
      console.log(nodeData);
      if (nodeData?.program) {
        this.heading = nodeData.program.name;
        this.subHeading = "socket number: " + nodeData.program.socket;
        this.timestamp = nodeData.program.timestamp;
        this.isIPNode = false;
        if (nodeData.program.name === "no process") {
          this.subHeading = NO_PROCESS_INFO;
        }
      }
      if (nodeData?.ip && nodeData?.name) {
        this.heading = nodeData.name !== "no hostname" ? nodeData.name : nodeData.ip;
        this.subHeading = nodeData.name !== "no hostname" ? "ip: " + nodeData.ip : "";
        this.isIPNode = true;
      }
      this.totalPackets = nodeData.tot_packets;
      this.isPanelOpen = true;
      this.isNodeSelected = true;
    });
  }
}
