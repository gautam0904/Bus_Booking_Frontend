import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { IseatgetApiResponse } from '../interfaces/iseatget-api-response';
import { Ibus } from '../interfaces/ibus';
import Swal from 'sweetalert2';
import { IbookingSeat } from '../interfaces/ibooking-seat';
import { IbookingSeatgetApiResponse } from '../interfaces/ibooking-seatget-api-response';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(private http: HttpClient) { }

  availableseat(busdata : Ibus): Observable<IseatgetApiResponse> {
    return this.http.post<IseatgetApiResponse>(`/bus/avilableSeat/` , {
      departure: busdata.departure,
      destination: busdata.destination,
      busId : busdata._id || ''
    }).pipe(

      catchError((error: any) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message || 'An error occurred',
          showConfirmButton : false,
          timer: 1500
        });
        throw error;
      })
    );
  }


  bookseat(seatdata : IbookingSeat): Observable<IbookingSeatgetApiResponse> {
    return this.http.post<IbookingSeatgetApiResponse>('/bus/book/' , seatdata).pipe(

      catchError((error: any) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message || 'An error occurred',
          showConfirmButton : false,
          timer: 1500
        });
        throw error;
      })
    );
  }
}
