import { EventEmitter, Injectable, Output } from '@angular/core';
import { GenericNode } from '../interfaces/d3-graph-interfaces';

@Injectable({
  providedIn: 'root'
})
export class InfoPanelService {
  @Output() toggleInfoPanelEvent = new EventEmitter<boolean>();
  @Output() updatePanelInfoEvent = new EventEmitter<GenericNode>();

  isPanelOpen: boolean = true;

  constructor() { }

  public toggleInfoPanel() {
    this.isPanelOpen = !this.isPanelOpen;
    this.toggleInfoPanelEvent.emit(this.isPanelOpen);
  }

  public updatePanelInfo(nodeData: GenericNode) {
    this.isPanelOpen = true;
    this.updatePanelInfoEvent.emit(nodeData);
  }
}
