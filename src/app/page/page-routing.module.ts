import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddBusComponent } from './add-bus/add-bus.component';
import { BookBusComponent } from './book-bus/book-bus.component';

const routes: Routes = [
  {
    path : '',
    component : DashboardComponent
  },
  {
    path : 'add-bus',
    component : AddBusComponent
  },
  {
    path : 'bus-book',
    component : BookBusComponent
  },
  {
    path : '**',
    redirectTo : 'dashboard',
    pathMatch : 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageRoutingModule { }
