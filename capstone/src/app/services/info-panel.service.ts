import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InfoPanelService {
  @Output() toggleInfoPanelEvent = new EventEmitter();


  constructor() { }

  public toggleInfoPanel() {
    this.toggleInfoPanelEvent.emit();
  }
}
