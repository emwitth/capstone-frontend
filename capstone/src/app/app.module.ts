import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphComponent } from './graph/graph.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InfoPannelComponent } from './info-pannel/info-pannel.component';

@NgModule({
  declarations: [
    AppComponent,
    GraphComponent,
    InfoPannelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
