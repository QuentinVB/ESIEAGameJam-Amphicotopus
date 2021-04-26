import { ActionManager, ExecuteCodeAction, Mesh } from 'babylonjs';
import Core from '../core';
import { AbstractState, Win, Lose } from './index'


enum Behavior {
  Alive,
  ToWinLevel,
  ToLose,
}
/**
 * A default state that does nothing (saddly)
 */
export default class StateGame extends AbstractState {
  private _trigger: Mesh;
  private _behavior: Behavior;


  //private goal;
  constructor(context: Core, trigger: Mesh) {
    super(context);
    //this.goal = this.context.level.scene.getMeshByName("Goal")
    this._trigger = trigger;
    this._behavior = Behavior.Alive;

    this.BindTrigger();
  }

  public Update(): void {

    switch (this._behavior) {
      case Behavior.Alive:
        console.log("game is running");
        if (this.context.stamina <= 0) {
          //ur dead
          this._behavior = Behavior.ToLose;
        }
        break;
      case Behavior.ToLose:
        this.Next(new Lose(this.context));
        break;
      case Behavior.ToWinLevel:
        console.log("you won the level !");
        this.Next(new Win(this.context));
        break;
      default:
        break;
    }
    /*
    if (this.context.level._character.intersectsMesh(this.context.level._ground, true)) {
      this.Next(new StateLose(this.context));
    }
    if (this.context.level._character.intersectsMesh(this.goal, true)) {
      this.Next(new StateWin(this.context));
    }*/
  }
  public Trigger(): void {
    //super.parname();
  }

  private BindTrigger(): void {
    this._trigger.checkCollisions = true;
    this.context.level._character.MainMesh.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnIntersectionEnterTrigger,
          parameter: this._trigger
        },
        () => {
          console.info("collided with victory, change state !");
          this._behavior = Behavior.ToWinLevel;
        }
      )
    );
  }
}