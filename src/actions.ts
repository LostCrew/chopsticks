interface ISetVolume {
  type: 'SET_VOLUME',
  volume: number
}

export type Action = ISetVolume;

export const setVolume = (volume: number): ISetVolume => ({ type: 'SET_VOLUME', volume });
