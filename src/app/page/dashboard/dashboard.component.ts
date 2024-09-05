import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Ibus } from 'src/app/core/interfaces/ibus';
import { IbusCreateApiResponse } from 'src/app/core/interfaces/ibus-create-api-response';
import { IbusgetApiResponse } from 'src/app/core/interfaces/ibusget-api-response';
import { BusService } from 'src/app/core/services/bus.service';
import { SharedService } from 'src/app/core/services/shared.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  role !: string;
  isedit = false;
  searching = false;
  searchBusForm!: FormGroup;
  buses: Ibus[] = [];
  cloneBus: Ibus | undefined;
  loading: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private busService: BusService,
    private sharedService: SharedService,
  ) {
    this.role = JSON.parse(localStorage.getItem('user') as string)?.role || "";
    this.searchBusForm = this.fb.group({
      departure: ['', Validators.required],
      destination: ['', Validators.required],
    })
  }

  ngOnInit(): void {
    this.busService.getAll().subscribe({
      next: (resdata: IbusgetApiResponse) => {
        this.loading = false;
        this.searching = false;
        if (resdata.data instanceof Array) {
          this.buses = resdata.data;
        } else {
          this.buses = [resdata.data];
        }
      },
      error: (err: any) => {
        this.loading = false;

      }
    })
  }

  addbus() {
    this.router.navigate(['/page/add-bus']);
  }
  onbusUpdate() {

  }

  bookBus(bus: Ibus) {
    if (this.searchBusForm) {
      const booedbus: Ibus = {
        _id: bus._id,
        busNumber: bus.busNumber,
        TotalSeat: bus.TotalSeat,
        departure: this.searchBusForm.get('departure')?.value,
        destination: this.searchBusForm.get('destination')?.value,
        charge: bus.charge,
        route: bus.route,
        departureTime: new Date().toISOString()
      }
      this.sharedService.setBookBusData(booedbus)
      this.router.navigate(['/page/bus-book']);
    }
  }

  onSubmit() {

    if (this.searchBusForm.valid) {

      this.loading = true;

      const submitObservable = this.busService.getBusbyFilter(this.searchBusForm.value);

      this.subscription.add(
        submitObservable.subscribe({
          next: (resdata: IbusgetApiResponse) => {
            this.loading = false;
            this.searching = false;
            if (resdata.data instanceof Array) {
              this.buses = resdata.data;
            } else {
              this.buses = [resdata.data];
            }
          },
          error: (err: any) => {
            this.loading = false;

          }
        })
      );
    } else {
      Object.values(this.searchBusForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

}
