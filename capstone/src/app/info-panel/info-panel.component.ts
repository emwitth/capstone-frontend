import { Component, OnInit } from '@angular/core';
import { InfoPanelService } from '../services/info-panel.service';
import { GenericNode } from '../interfaces/d3-graph-interfaces';

@Component({
  selector: 'app-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.css']
})
export class InfoPanelComponent implements OnInit {
  isPanelOpen: boolean = true;
  selectedNode: GenericNode = {
    tot_packets: -1,
    program: {
      name: "",
      socket: "",
      timestamp: ""
    },
    name: "",
    ip: "",
    x: 0,
    y: 0
  }

  constructor(private infoPanelService:InfoPanelService) { }

  ngOnInit(): void {
    this.infoPanelService.toggleInfoPanelEvent.subscribe((isPanelOpen: boolean) => {
      this.isPanelOpen = isPanelOpen;
    });

    this.infoPanelService.updatePanelInfoEvent.subscribe((nodeData: GenericNode) => {
      console.log(nodeData);
      this.isPanelOpen = true;
      this.selectedNode = nodeData;
    });
  }

  isProgramThere() {
    this.selectedNode?.program && this.selectedNode?.program.name != '';
  }

  getProgName() {
    return this.selectedNode.program ? this.selectedNode.program.name : "";
  }

}
