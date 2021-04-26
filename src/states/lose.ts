import Core from '../core';
import { Default } from './index';
import AbstractState from './state'

export default class StateLose extends AbstractState {
  //private goal;
  constructor(context: Core) {
    super(context);
    //this.goal = this.context.level.scene.getMeshByName("Goal")
  }

  public Update(): void {
    if (this.active) {
      //display turtle death
      this.active = false;
      this.context.setScenarioStep(4);
      this.Next(new Default(this.context));
    }
  }
  public Trigger(): void {
    //super.parname();
  }
}