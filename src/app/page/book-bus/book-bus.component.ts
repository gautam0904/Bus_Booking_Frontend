import { BusService } from 'src/app/core/services/bus.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IbookingSeatgetApiResponse } from 'src/app/core/interfaces/ibooking-seatget-api-response';
import { Ibus } from 'src/app/core/interfaces/ibus';
import { IseatgetApiResponse } from 'src/app/core/interfaces/iseatget-api-response';
import { BookingService } from 'src/app/core/services/booking.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { Router } from '@angular/router';
import { IbusgetApiResponse } from 'src/app/core/interfaces/ibusget-api-response';

@Component({
  selector: 'app-book-bus',
  templateUrl: './book-bus.component.html',
  styleUrls: ['./book-bus.component.scss']
})
export class BookBusComponent implements OnInit {
  seats: number[] = [];
  selectedSeat: any | undefined = undefined;
  bookedbus: Ibus | undefined = undefined;
  bus: Ibus | undefined = undefined;
  bookingForm !: FormGroup;
  loading: boolean = false;
  selectedOption: string = '';

  options = [
    { id: 'option1', label: 'payment by upi' },
    { id: 'option2', label: 'payment by upi' },
  ];


  constructor(
    private bookingService: BookingService,
    private busService: BusService,
    private router: Router,
    private sharedService: SharedService,
    private fb: FormBuilder,
  ) {

  }

  ngOnInit(): void {
    this.sharedService.bookBus$.subscribe(bus => {
      this.bookedbus = bus
      this.seats = Array.from({ length: this.bookedbus?.TotalSeat || 20 }, (_, index) => (index + 1));
        this.bookingService.availableseat(bus as Ibus).subscribe({
          next: (resdata: IseatgetApiResponse) => {

            if (resdata.data instanceof Array) {
              resdata.data.forEach((bookedseat : any)=> {

                this.seats = this.seats.filter(p => p !== bookedseat.seatNumber );
              })
            } else {
              this.seats = [resdata.data];
            }
          },
        })

    });

  }

  onChange(option: string) {
    this.selectedOption = option;
    if (this.selectedOption == 'option1') {
      this.bookingForm.patchValue({
        payment : this.bookingForm.get('payment')?.value + 26
      })
    }
    else if (this.selectedOption == 'option2') {
      this.bookingForm.patchValue({
      payment : this.bookingForm.get('payment')?.value - 26
      })
    }

  }

  toggleSeat(seat: number): void {
    this.selectedSeat = seat;
    this.bookingForm = this.fb.group({
      busId : ['', Validators.required],
      seatNumber: [seat, Validators.required],
      departure: ['', Validators.required],
      destination: ['', Validators.required],
      departureTime: ['', Validators.required],
      payment: ['', Validators.required],
    })
    if (this.bookedbus) {

      this.busService.getBusbyId(this.bookedbus._id || '').subscribe({
        next: (resdata: IbusgetApiResponse) => {
          this.loading = false;
          this.bus = resdata.data as Ibus;
        },
        error: (err: any) => {
          this.loading = false;
        }
      })

      const busRoute = this.bookedbus.route
      let userpreviusdistance = 0;
      let userdistance = 0;
      let previusstation = busRoute[0].previousStation;
      busRoute.forEach((route, index) => {
        if (route.previousStation === previusstation) {
          userdistance += route.distance;
          previusstation = route.currentStation;
        } else {
          userpreviusdistance += route.distance;
        }
      });

      this.bookingForm.patchValue({
        busId: this.bookedbus._id,
        seatNumber: seat,
        departure: this.bookedbus.departure,
        destination: this.bookedbus.destination,
        departureTime:( this.bookedbus.departureTime + userpreviusdistance / 50),
        payment: userdistance * this.bookedbus.charge,
      });
    }


  }

  onSubmit() {

    if (this.bookingForm.valid) {

      this.loading = true;
      this.bookingService.bookseat(this.bookingForm.value).subscribe({
        next: (resdata: IbookingSeatgetApiResponse) => {
          this.loading = false;
          this.router.navigate (['/page']);
        },
        error: (err: any) => {
          this.loading = false;

        }
      })
        ;
    } else {
      Object.values(this.bookingForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }


}
