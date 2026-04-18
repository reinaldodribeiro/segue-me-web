import { TooltipPosition } from './types';

export const GAP = 8;

export const ARROW: Record<TooltipPosition, string> = {
  top:    'w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1',
  bottom: 'w-2 h-2 bg-gray-900 rotate-45 mx-auto -mb-1 order-first',
  left:   'w-2 h-2 bg-gray-900 rotate-45 my-auto -mr-1 self-center order-last',
  right:  'w-2 h-2 bg-gray-900 rotate-45 my-auto -ml-1 self-center order-first',
};

export const ARROW_WRAPPER: Record<TooltipPosition, string> = {
  top:    'flex flex-col',
  bottom: 'flex flex-col',
  left:   'flex flex-row items-center',
  right:  'flex flex-row items-center',
};
