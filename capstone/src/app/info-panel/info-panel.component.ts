import { Component, OnInit } from '@angular/core';
import { InfoPanelService } from '../services/info-panel.service';

@Component({
  selector: 'app-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.css']
})
export class InfoPanelComponent implements OnInit {
  isPanelOpen: boolean = true;

  constructor(private infoPanelService:InfoPanelService) { }

  ngOnInit(): void {
    this.infoPanelService.toggleInfoPanelEvent.subscribe(() => {
      this.isPanelOpen = !this.isPanelOpen;
    });
  }

}
