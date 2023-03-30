import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphComponent } from './graph/graph.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { HttpClientModule } from '@angular/common/http';
import { InfoPanelComponent } from './info-panel/info-panel.component';
import { PacketInfoDisplayComponent } from './packet-info-display/packet-info-display.component';
import { HiddenItemsListComponent } from './hidden-items-list/hidden-items-list.component';
import { SaveComponent } from './save/save.component';
import { SessionListComponent } from './session-list/session-list.component';

@NgModule({
  declarations: [
    AppComponent,
    GraphComponent,
    ToolbarComponent,
    InfoPanelComponent,
    PacketInfoDisplayComponent,
    HiddenItemsListComponent,
    SaveComponent,
    SessionListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      positionClass:'toast-top-right'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
