import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Iuser } from '../interfaces/iuser';
import { Ibus } from '../interfaces/ibus';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private profile = new BehaviorSubject<Iuser | undefined>(undefined);
  profile$ = this.profile.asObservable();

  private bookBus  = new BehaviorSubject<Ibus | undefined>(undefined);
  bookBus$ = this.bookBus.asObservable();

  private bus = new BehaviorSubject<Ibus | undefined>(undefined);
  bus$ = this.bus.asObservable();

  setProfileData(value: Iuser) {
    this.profile.next(value);
  }

  setBookBusData(value: Ibus) {
    this.bookBus.next(value);
  }

  setBusData(value: Ibus) {
    this.bus.next(value);
  }

}
