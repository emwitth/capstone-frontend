import { EventEmitter, Injectable, Output } from '@angular/core';
import { GenericNode, LinkData } from '../interfaces/d3-graph-interfaces';

@Injectable({
  providedIn: 'root'
})
export class InfoPanelService {
  @Output() toggleInfoPanelEvent = new EventEmitter<boolean>();
  @Output() updatePanelNodeInfoEvent = new EventEmitter<GenericNode>();
  @Output() updatePanelLinkInfoEvent = new EventEmitter<LinkData>();

  isPanelOpen: boolean = true;

  constructor() { }

  public toggleInfoPanel() {
    this.isPanelOpen = !this.isPanelOpen;
    this.toggleInfoPanelEvent.emit(this.isPanelOpen);
  }

  public updatePanelNodeInfo(nodeData: GenericNode) {
    this.isPanelOpen = true;
    this.updatePanelNodeInfoEvent.emit(nodeData);
  }

  public updatePanelLinkInfo(linkData: LinkData) {
    this.isPanelOpen = true;
    this.updatePanelLinkInfoEvent.emit(linkData);
  }
}
