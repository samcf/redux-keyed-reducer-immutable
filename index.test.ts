import Immutable from "immutable";
import { Action, combineReducers, createStore } from "redux";
import { bindKeyedActions } from "redux-keyed-reducer";
import test from "tape";

import { createKeyedReducer } from "./index";

type ICounterState = number;

enum CounterActions {
    Increment = "Increment",
    Decrement = "Decrement",
}

const counter = (state: ICounterState = 0, action: Action<CounterActions>) => {
    switch (action.type) {
        case CounterActions.Increment:
            return state + 1;
        case CounterActions.Decrement:
            return state - 1;
        default:
            return state;
    }
};

test("keyed reducer state is an Immutable map", (assert) => {
    const reducer = createKeyedReducer(counter, "counter", { isKeyRequired: false });
    const store = createStore(combineReducers({
        counter: reducer,
    }));

    const actions = bindKeyedActions({
        onDecrement: () => ({ type: CounterActions.Decrement }),
        onIncrement: () => ({ type: CounterActions.Increment }),
    }, { counter: "testKey" }, store.dispatch);

    actions.onIncrement();

    const state = store.getState();
    assert.ok(
        state.counter.equals(
            Immutable.Map({ default: 0, testKey: 1 }),
        ),
        JSON.stringify(state.counter),
    );
    assert.end();
});
