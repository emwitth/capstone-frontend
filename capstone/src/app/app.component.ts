import { Component, OnInit } from '@angular/core';
import { InfoPanelService } from './services/info-panel.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Remora Fish';
  isInfoPanelOpen: boolean = true;
  graphComponentWidthClasses = [
    "graph-component-width-info-open",
    "graph-component-width-info-closed"
  ];

  constructor(private infoPanelService: InfoPanelService) {}

  ngOnInit() {
    this.infoPanelService.toggleInfoPanelEvent.subscribe((isPanelOpen: boolean) => {
      this.isInfoPanelOpen = isPanelOpen;
    });

    this.infoPanelService.updatePanelInfoEvent.subscribe(() => {
      this.isInfoPanelOpen = true;
    });
  }

  calculateWidthClass() {
    if(this.isInfoPanelOpen) {
      return this.graphComponentWidthClasses[0];
    }
    else {
      return this.graphComponentWidthClasses[1];
    }
  }
}
