import { EventEmitter, Injectable, Output } from '@angular/core';
import { GenericNode, LinkData } from '../interfaces/d3-graph-interfaces';
import { Link } from '../interfaces/link';

@Injectable({
  providedIn: 'root'
})
export class InfoPanelService {
  @Output() toggleInfoPanelEvent = new EventEmitter<boolean>();
  @Output() updatePanelNodeInfoEvent = new EventEmitter<GenericNode>();
  @Output() updatePanelLinkInfoEvent = new EventEmitter<LinkData>();
  @Output() linkSelectedEvent = new EventEmitter<Link>();
  @Output() showAllPacketsEvent = new EventEmitter();

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

  public selectLink(link: Link) {
    this.linkSelectedEvent.emit(link);
  }

  public showAllPackets() {
    this.showAllPacketsEvent.emit();
  }
  
}
