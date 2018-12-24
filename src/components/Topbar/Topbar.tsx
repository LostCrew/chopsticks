import * as React from 'react'

import { NAME } from '../../constants';
import { IDispatch, IState } from './index'

export default class Topbar extends React.Component<IState & IDispatch> {
  public onChange = ({ currentTarget: { value } }: React.FormEvent<HTMLInputElement>) =>
    this.props.setVolume(parseFloat(value));

  public render() {
    const { bar, beat, phrase, volume } = this.props;
    return (
      <header
        className="navbar is-light"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="container">
          <div className="navbar-brand">
            <div className="navbar-item">
              <h1 className="title is-4">
                <a href="/">{NAME}</a>
              </h1>
            </div>
          </div>
          <div className="navbar-menu">
            <div className="navbar-start">
              <div className="navbar-item">
                Phrase: <strong>{phrase}</strong>
              </div>
              <div className="navbar-item">
                Bar: <strong>{bar}</strong>
              </div>
              <div className="navbar-item">
                Beat: <strong>{beat}</strong>
              </div>
            </div>
            <div className="navbar-end">
              <div className="navbar-item">
                Volume:
                <input
                  id="volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={this.onChange}
                  className="progress"
                />
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
}
