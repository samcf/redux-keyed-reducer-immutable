import Immutable from "immutable";
import { Map } from "immutable";
import { Action, AnyAction, Reducer } from "redux";

interface IKeyedReducerOptions {
    isKeyRequired?: boolean;
}

interface IStoreKeys {
    [key: string]: string;
}

type IKeyedState<S> = Map<string, S>;

// SENTINEL_ACTION is a Redux action that is unlikely to be "switched" over in
// the given reducer. This is useful for deriving the initial state of the
// reducer.
const SENTINEL_ACTION: Action<"@@ReduxKeyedReducerImmutable"> = {
    type: "@@ReduxKeyedReducerImmutable",
};

// DEFAULT_INSTANCE_KEY is the name of the key in the keyed reducer state whose
// value will always be the initial state for the given reducer function. This
// is derived by running the given reducer with a fake action that is unlikely
// to be "switched" over.
const DEFAULT_INSTANCE_KEY = "default";

// getStoreKeys returns an object of store keys found decorated on the given
// action. Returns an empty object if no store keys are found.
function getStoreKeys(action: AnyAction): IStoreKeys {
    if (!("meta" in action)) {
        return {};
    }

    if (!("storeKeys" in action.meta)) {
        return {};
    }

    return action.meta.storeKeys;
}

// createKeyedReducer returns a new Redux reducer. This reducer's state is
// an Immutable.Map containing one or more instances of the given reducer's
// state.
export function createKeyedReducer<S, A extends Action = AnyAction>(
    reducer: Reducer<S, A>,
    storeKey: string,
    options: IKeyedReducerOptions = {},
) {
    const initialState = reducer((void 0), SENTINEL_ACTION as A);
    return (state: IKeyedState<S> = Immutable.Map(), action: A) => {
        state = state.set(DEFAULT_INSTANCE_KEY, initialState);

        const storeKeys = getStoreKeys(action);
        if (storeKey in storeKeys) {
            return state.set(storeKeys[storeKey], reducer(state.get(storeKeys[storeKey]), action));
        }

        if (options.isKeyRequired) {
            return state;
        }

        return state.map((prevState) => reducer(prevState, action));
    };
}
