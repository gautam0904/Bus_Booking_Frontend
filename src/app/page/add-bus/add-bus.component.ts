import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Ibus } from 'src/app/core/interfaces/ibus';
import { IbusCreateApiResponse } from 'src/app/core/interfaces/ibus-create-api-response';
import { BusService } from 'src/app/core/services/bus.service';
import { SharedService } from 'src/app/core/services/shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-bus',
  templateUrl: './add-bus.component.html',
  styleUrls: ['./add-bus.component.scss']
})
export class AddBusComponent {
  isedit = false;
  routeValid = true;
  role!: string;
  busForm!: FormGroup;
  cloneBus: Ibus | undefined;
  loading: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(private fb: FormBuilder,
    private busService: BusService,
    private router: Router,
    private sharedService: SharedService,

  ) {
    this.role =  JSON.parse(localStorage.getItem('user') as string)?.role || "";
    this.busForm = this.fb.group({
      _id: [""],
      departure: ['', Validators.required],
      departureTime: ['', Validators.required],
      destination: ['', Validators.required],
      TotalSeat: ['', Validators.required],
      charge: ['', Validators.required],
      route: this.fb.array([])
    });

  }

  ngOnInit(): void {
    this.subscription.add(
      this.sharedService.bus$.subscribe(b => {
        this.cloneBus = b;
        this.setInitialValues();
      })
    );
  }
  get routeArray() {
    return (this.busForm.get('route') as FormArray);
  }

  createRoute(): FormGroup {
    return this.fb.group({
      previousStation: ['', Validators.required],
      currentStation: ['', Validators.required],
      distance: ['', Validators.required],
    });
  }

  addRoute() {
    this.routeArray.push(this.createRoute());
  }

  deleteRoute(index: number) {
    if (this.routeArray.length > 1) {
      this.routeArray.removeAt(index);
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: 'An error occurred',
        showConfirmButton: false,
        timer: 2000
      });
    }
  }

  setInitialValues() {

    if (this.cloneBus) {
      this.isedit = true;
      this.busForm.patchValue({
        _id: this.cloneBus._id,
        departure: this.cloneBus.departure,
        departureTime: this.cloneBus.departureTime,
        destination: this.cloneBus.destination,
        TotalSeat: this.cloneBus.TotalSeat,
        charge: this.cloneBus.charge,
        route: this.cloneBus.route
      });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  onSubmit() {

    if (this.routeArray && this.routeArray.length > 0) {
      const lastIndex = this.routeArray.length - 1;
      const lastRoute = this.routeArray.at(lastIndex) as FormGroup;


      if (lastRoute && lastRoute.get('currentStation')) {
        const currentStationValue = lastRoute.get('currentStation')?.value ?? '';

        this.busForm.patchValue({
          destination: currentStationValue
        });
      }
    }
    else {
      this.routeValid = false;
    }
    if (this.busForm.valid) {
      this.loading = true;
      const submitObservable = this.isedit ?
        this.busService.updateBus(this.busForm.value) :
        this.busService.createBus(this.busForm.value);

      this.subscription.add(
        submitObservable.subscribe({
          next: (resdata: IbusCreateApiResponse) => {
            this.loading = false;
            this.router.navigate(['/page']);
          },
          error: (err: any) => {
            this.loading = false;

          }
        })
      );
    } else {
      Object.values(this.busForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

}
