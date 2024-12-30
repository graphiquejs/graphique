export enum FocusType {
  /** pointer events focus all groups within bars */
  GROUP = 'group',
  /** pointer events focus individual groups within bars */
  INDIVIDUAL = 'individual',
}

export enum Position {
  /** groups are positioned directly "on top" of each other (no effect on x scale) */
  IDENTITY = 'identity',
  /** groups are stacked horizontally after any previous groups (additive effect on x scale) */
  STACK = 'stack',
  /** groups are positioned vertically after any previous groups (no effect on x scale) */
  DODGE = 'dodge',
  /** groups are stacked horizontally as proportion of group total after any previous groups (x scale domain set to [0, 1]) */
  FILL = 'fill',
}
