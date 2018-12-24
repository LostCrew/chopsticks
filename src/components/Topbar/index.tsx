import * as reactRedux from 'react-redux'
import * as redux from 'redux'

import { setVolume } from '../../actions'
import { IStore } from '../../reducers'
import Topbar from './Topbar';

export type IState = IStore

export interface IDispatch {
  setVolume: (n: number) => void
}

const mapStateToProps = (state: IStore): IState => state
const mapDispatchToProps = (dispatch: redux.Dispatch): IDispatch => ({
  setVolume: (n: number) => dispatch(setVolume(n))
})

export default reactRedux.connect(mapStateToProps, mapDispatchToProps)(Topbar)
