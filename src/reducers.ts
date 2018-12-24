import { Action } from './actions'

export interface IStore {
    bar: number,
    beat: number,
    phrase: number,
    volume: number
}

export const initial: IStore = {
    bar: 1,
    beat: 1,
    phrase: 1,
    volume: 0.5,
}

export default (state: IStore = initial, action: Action): IStore => {
    const { type } = action
    switch (type) {
        case 'SET_VOLUME':
            return { ...state, volume: action.volume };
    }
    return state;
}
