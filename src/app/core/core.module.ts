import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexDbService } from './index-db.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [IndexDbService]
})
export class CoreModule { }
