
import React from 'react';
import Appear from './Appear';

type Props = {
  children: React.ReactNode;
  index: number;
  baseDelay?: number;
  from?: 'bottom' | 'top' | 'left' | 'right' | 'scale' | 'none';
  replayOnFocus?: boolean;
};

export default function Stagger({
  children,
  index,
  baseDelay = 60,
  from = 'bottom',
  replayOnFocus = true,
}: Props) {
  return (
    <Appear from={from} delay={index * baseDelay} replayOnFocus={replayOnFocus}>
      {children}
    </Appear>
  );
}
