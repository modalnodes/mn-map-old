import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkerLayer, MapboxLayer, BaseLayer, NamedLayer, DataLayer, MnMapComponent } from './mn-map.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [MarkerLayer, MapboxLayer, BaseLayer, NamedLayer, DataLayer, MnMapComponent]
})
export class MnMapModule { }
