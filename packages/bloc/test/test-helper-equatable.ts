import { Bloc, BlocObserver, NextFunction, Transition } from '../lib/bloc'
import { Observable } from 'rxjs'
import { distinct, switchMap } from 'rxjs/operators'

export class CounterBlocError extends Error {}

export abstract class CounterEvent {}

export class IncrementEvent extends CounterEvent {}

export class DecrementEvent extends CounterEvent {}

export class SetEvent extends CounterEvent {
  public value: number;
  constructor(value: number) {
    super();
    this.value = value;
  }
}

export class CounterState {
  public value: number;
  constructor(value: number) {
    this.value = value;
  }

  copyWith(data: Partial<CounterState>) {
    return new CounterState(
      data.value ?? this.value
    )
  }
}

export class CounterBloc extends Bloc<CounterEvent, CounterState> {
  constructor(private throwOnTransition: boolean = false) {
    super(new CounterState(0))
  }

  async *mapEventToState(event: CounterEvent) {
    if(event instanceof IncrementEvent) {
      yield this.state.copyWith({value: this.state.value + 1})
    } else if(event instanceof DecrementEvent) {
      yield this.state.copyWith({value: this.state.value + 1})
    } else if(event instanceof SetEvent) {
      yield this.state.copyWith({value: event.value})
    } else {
      throw new CounterBlocError()
    }
  }

  onTransition(_: Transition<CounterEvent, CounterState>) {
    super.onTransition(_)
    if (this.throwOnTransition) {
      throw new CounterBlocError()
    }
    return
  }
}

export class DistinctCounterBloc extends CounterBloc {
  transformEvents(events: Observable<CounterEvent>, next: NextFunction<CounterEvent, CounterState>) {
    return super.transformEvents(events.pipe(distinct(
      (event) => JSON.stringify(event)
    )), next)
  }
}

export class SwitchMapCounterBloc extends CounterBloc {
  transformEvents(events: Observable<CounterEvent>, next: NextFunction<CounterEvent, CounterState>) {
    return events.pipe(switchMap(next))
  }
}

export class MyBlocObserver extends BlocObserver {
}
