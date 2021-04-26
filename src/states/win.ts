import Core from '../core';
import { Default } from './index';
import AbstractState from './state'
/*
import StateLose from './lose';
import StateWin from './win';
*/
/**
 * A default state that does nothing (saddly)
 */
export default class StateWin extends AbstractState {
  //private goal;
  constructor(context: Core) {
    super(context);
    //this.goal = this.context.level.scene.getMeshByName("Goal")
  }

  public Update(): void {
    if (this.active) {
      this.active = false;
      this.context.setScenarioStep(3);
      this.Next(new Default(this.context));
    }
  }
  public Trigger(): void {
    //super.parname();
  }
}