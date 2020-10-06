import { BlocObserver, Transition, EventStreamClosedError, Bloc } from '../lib/bloc'
import {
  CounterBloc,
  CounterEvent,
  CounterState,
  DecrementEvent,
  IncrementEvent,
  SetEvent,
  CounterBlocError,
  DistinctCounterBloc,
  SwitchMapCounterBloc,
  MyBlocObserver
} from './test-helper-equatable'

describe('CounterBloc', () => {
  let counterBloc: CounterBloc
  let blocObserver: BlocObserver

  beforeEach(() => {
    counterBloc = new CounterBloc()
    // Bloc.observer = new MyBlocObserver();
    blocObserver = Bloc.observer
    spyOn(blocObserver, 'onEvent').and.returnValue(undefined)
    spyOn(blocObserver, 'onTransition').and.returnValue(undefined)
    spyOn(blocObserver, 'onError').and.returnValue(undefined)
  })

  afterEach(() => {
    counterBloc.close()
  })

  it('is instantiable', () => {
    expect(counterBloc).toBeInstanceOf(CounterBloc)
  })

  it('has correct initial state', () => {
    expect(counterBloc.state).toEqual(new CounterState(0))
  })

  it('has correct state stream before events are added', async done => {
    const emittedStates: CounterState[] = []
    counterBloc.listen(
      state => {
        emittedStates.push(state)
      },
      undefined,
      () => {
        expect(emittedStates).toEqual([])
        done()
      }
    )
    setTimeout(() => {
      counterBloc.close()
    }, 0)
  })

  it('has correct state after a single event is added', async done => {
    const emittedStates: CounterState[] = []
    counterBloc.listen(
      state => {
        emittedStates.push(state)
      },
      undefined,
      () => {
        expect(emittedStates).toEqual([new CounterState(1)])
        expect(blocObserver.onEvent).toBeCalledWith(counterBloc, new IncrementEvent())
        expect(blocObserver.onTransition).toBeCalledWith(
          counterBloc,
          new Transition<CounterEvent, CounterState>(new CounterState(0), new IncrementEvent(), new CounterState(1))
        )
        expect(blocObserver.onError).not.toBeCalled()
        done()
      }
    )
    counterBloc.add(new IncrementEvent())
    setTimeout(() => {
      counterBloc.close()
    }, 0)
  })

  it('has correct state after a multiple events are added', async done => {
    const emittedStates: CounterState[] = []
    counterBloc.listen(
      state => {
        emittedStates.push(state)
      },
      undefined,
      () => {
        expect(emittedStates).toEqual([new CounterState(1), new CounterState(2), new CounterState(3)])
        expect(blocObserver.onEvent).toBeCalledWith(counterBloc, new IncrementEvent())
        expect(blocObserver.onEvent).toBeCalledTimes(3)
        expect(blocObserver.onTransition).toBeCalledWith(
          counterBloc,
          new Transition(new CounterState(0), new IncrementEvent(), new CounterState(1))
        )
        expect(blocObserver.onTransition).toBeCalledWith(
          counterBloc,
          new Transition(new CounterState(1), new IncrementEvent(), new CounterState(2))
        )
        expect(blocObserver.onTransition).toBeCalledWith(
          counterBloc,
          new Transition(new CounterState(2), new IncrementEvent(), new CounterState(3))
        )
        expect(blocObserver.onTransition).toBeCalledTimes(3)
        expect(blocObserver.onError).not.toBeCalled()
        done()
      }
    )
    counterBloc.add(new IncrementEvent())
    counterBloc.add(new IncrementEvent())
    counterBloc.add(new IncrementEvent())
    setTimeout(() => {
      counterBloc.close()
    }, 0)
  })


  it('has correct state after a multiple events are added', async done => {
    const emittedStates: CounterState[] = []
    counterBloc.listen(
      state => {
        emittedStates.push(state)
      },
      undefined,
      () => {
        expect(emittedStates).toEqual([new CounterState(1)])
        expect(blocObserver.onEvent).toBeCalledWith(counterBloc, new SetEvent(1))
        expect(blocObserver.onEvent).toBeCalledTimes(3)
        expect(blocObserver.onTransition).toBeCalledWith(
          counterBloc,
          new Transition(new CounterState(0), new SetEvent(1), new CounterState(1))
        )
        expect(blocObserver.onTransition).toBeCalledTimes(1)
        expect(blocObserver.onError).not.toBeCalled()
        done()
      }
    )
    counterBloc.add(new SetEvent(1))
    counterBloc.add(new SetEvent(1))
    counterBloc.add(new SetEvent(1))
    setTimeout(() => {
      counterBloc.close()
    }, 0)
  })

  
  it('has correct state when transform used to filter distinct events', async done => {
    counterBloc = new DistinctCounterBloc()
    const emittedStates: CounterState[] = []
    counterBloc.listen(
      state => {
        emittedStates.push(state)
      },
      undefined,
      () => {
        expect(emittedStates).toEqual([new CounterState(1)])
        expect(blocObserver.onEvent).toBeCalledWith(counterBloc, new IncrementEvent())
        expect(blocObserver.onTransition).toBeCalledWith(
          counterBloc,
          new Transition(new CounterState(0), new IncrementEvent(), new CounterState(1))
        )
        expect(blocObserver.onError).not.toBeCalled()
        done()
      }
    )
    counterBloc.add(new IncrementEvent())
    counterBloc.add(new IncrementEvent())
    setTimeout(() => {
      counterBloc.close()
    }, 0)
  })

  it('calls onError when onTransition throws', async done => {
    counterBloc = new CounterBloc(true)
    const emittedStates: CounterState[] = []
    counterBloc.listen(
      state => {
        emittedStates.push(state)
      },
      undefined,
      () => {
        expect(emittedStates).toEqual([])
        expect(blocObserver.onError).toBeCalledWith(counterBloc, new CounterBlocError())
        expect(blocObserver.onError).toBeCalledTimes(1)
        done()
      }
    )
    counterBloc.add(new IncrementEvent())
    setTimeout(() => {
      counterBloc.close()
    }, 0)
  })

  it('cannot add after close called', () => {
    counterBloc.close()
    counterBloc.add(new IncrementEvent())

    expect(blocObserver.onError).toBeCalledWith(counterBloc, new EventStreamClosedError())
    expect(blocObserver.onError).toBeCalledTimes(1)
  })
})
