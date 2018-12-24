import * as redux from 'redux'

import reducers, { IStore } from './reducers'

export default redux.createStore(reducers) as redux.Store<IStore>
