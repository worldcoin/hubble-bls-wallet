import { Component, ReactElement, ReactNode } from 'react';
import TypedEventEmitter from 'typed-emitter';

import NotificationContainer from './NotificationContainer';
import OverlayContainer from './OverlayContainer';
import ScreenContainer from './ScreenContainer';

export type PageOverlay = (close: () => void) => ReactElement;

export type PageEventMap = {
  notification(level: 'info' | 'error', text: string): void;
  overlay(overlay: PageOverlay): void;
  screen(screen: ReactElement): void;
};

export type PageEvents = TypedEventEmitter<PageEventMap>;

type Props = {
  classes?: string[];
  events: PageEvents;
};

// eslint-disable-next-line @typescript-eslint/ban-types
type State = {};

export default class Page extends Component<Props, State> {
  render(): ReactNode {
    const classes = ['page', ...(this.props.classes ?? [])];

    return (
      <div className={classes.join(' ')}>
        <ScreenContainer events={this.props.events}>
          {this.props.children}
        </ScreenContainer>
        <NotificationContainer events={this.props.events} />
        <OverlayContainer events={this.props.events} />
      </div>
    );
  }
}
