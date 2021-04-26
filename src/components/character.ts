import Level from '../level/level'
import { Vector3, PhysicsImpostor, Mesh, SpriteManager, Sprite, KeyboardEventTypes, PointerEventTypes, AbstractMesh, ActionManager } from 'babylonjs';

import GameObject from './gameobject';

interface ITurtleState {
  state: TurtleState
  manager: SpriteManager,
  animationStart: number,
  animationEnd: number,
  animationDelay: number,
}

enum TurtleState {
  Idle,
  Swimming
}

const TurtleStates: ITurtleState[] = [];

//TODO : should use the 
export default class Character extends GameObject {
  public turtle: Sprite;
  public turtlePhysic: PhysicsImpostor;
  public turtleState: ITurtleState;
  public turtleCameraTarget: AbstractMesh;

  private readonly TARGETDISTANCE = 1;
  private readonly SPRITEOFFSET_Y = 1.4;
  private readonly BASESPEED = 0.3;
  private readonly MOVEMENTSPEED = 0.5;

  constructor(level: Level, mesh?: Mesh) {
    super(level);

    if (mesh) {
      this.MainMesh = mesh;
      //this.MainMesh.isVisible = false;
      //TODO : should cast shadow !

    }
    else {
      throw "NOPE";
    }

    this.turtleCameraTarget = new AbstractMesh("turtleCameraTarget", this.Scene);
    this.turtleCameraTarget.position = new Vector3(this.MainMesh.position.x, this.MainMesh.position.y + this.TARGETDISTANCE, this.MainMesh.position.z)
    this.turtleCameraTarget.parent = this.MainMesh;

    this.turtlePhysic = new PhysicsImpostor(this.MainMesh, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 1, friction: 1 }, this.Scene);
    this.MainMesh.physicsImpostor = this.turtlePhysic;
    this.turtlePhysic.registerBeforePhysicsStep(() => {
      //lock rotation
      this.turtlePhysic.setAngularVelocity(Vector3.Zero());
    });
    this.LoadTurtleStates();
    this.UpdateTurtleState(TurtleState.Idle);

    //--COLLISIONS--
    this.MainMesh.actionManager = new ActionManager(this.Scene);

    //bind controls
    this.Scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type == KeyboardEventTypes.KEYDOWN) {
        switch (kbInfo.event.keyCode) {
          case 90://Z - UP
            console.log("pressed Z");
            //this.MainMesh.rotate(Vector3.Right(), -Math.PI / 8);
            this.turtlePhysic.applyImpulse(Vector3.Up(), this.MainMesh.getAbsolutePosition())
            break;
          case 81://Q - LEFT
            this.turtlePhysic.applyImpulse(Vector3.Left(), this.MainMesh.getAbsolutePosition());
            this.turtle.angle = Math.PI / 8;
            break;
          case 83://S - DOWN

            this.turtlePhysic.applyImpulse(Vector3.Down(), this.MainMesh.getAbsolutePosition())
            break;
          case 68://D - RIGHT

            this.turtlePhysic.applyImpulse(Vector3.Right(), this.MainMesh.getAbsolutePosition())
            this.turtle.angle = -Math.PI / 8;
            break;
          //spaceBar
          case 32:
            //new Vector3(this.MainMesh.forward.x, this.MainMesh.forward.y, this.MainMesh.forward.z)
            this.turtlePhysic.applyImpulse(Vector3.Forward().scale(this.Env.CONFIG.SPEED), this.MainMesh.getAbsolutePosition());
            break;
        }
      }
    });
    this.Scene.onPointerObservable.add((mouseData) => {
      if (mouseData.type == PointerEventTypes.POINTERMOVE) {

        //HACK : offsetX and Y are still experimentals /!\ check browser compatibility
        //console.log(`Δ ${mouseData.event.movementX}:${-mouseData.event.movementY} @ pos ${mouseData.event.offsetX}:${mouseData.event.offsetY}`);
        const MouseVector = new Vector3(mouseData.event.movementX * this.MOVEMENTSPEED, -mouseData.event.movementY * this.MOVEMENTSPEED, this.BASESPEED);
        this.turtlePhysic.applyImpulse(MouseVector, this.MainMesh.getAbsolutePosition());
        //TODO : use mouse vector to animate orientation
        //Vector2.Lerp()

      }
    });

    //let forwardLine;
    this.Env.registerFunctionBeforeUpdate(() => {
      //update sprite position
      this.turtle.position = new Vector3(this.MainMesh.position.x, this.MainMesh.position.y + this.SPRITEOFFSET_Y, this.MainMesh.position.z);
      //HACK : clamp speed
      this.turtlePhysic.setLinearVelocity(Vector3.Clamp(this.turtlePhysic.getLinearVelocity(), this.Env.CONFIG.MIN_VELOCITY_VECTOR, this.Env.CONFIG.MAX_VELOCITY_VECTOR));
      //if (forwardLine) forwardLine.dispose();
      //forwardLine = Helpers.DrawVector(this.Scene, this.MainMesh.forward, 7, this.MainMesh.getAbsolutePosition(), Color3.Purple());

      //TODO : countdown, when done and no button pressed, reset
      if (this.turtlePhysic.getLinearVelocity().length() > 0.1 && this.turtleState.state == TurtleState.Idle) {
        this.UpdateTurtleState(TurtleState.Swimming);
      }
      else if (this.turtlePhysic.getLinearVelocity().length() < 0.1 && this.turtleState.state == TurtleState.Swimming) {
        this.UpdateTurtleState(TurtleState.Idle);
      }
    });


  }
  LoadTurtleStates(): void {
    TurtleStates[TurtleState.Idle] = {
      state: TurtleState.Idle,
      manager: new SpriteManager("turtleSprite", "./public/img/Sprite-Tortue-Repos-4x3-min.png", 1, 256, this.Scene),
      animationStart: 0,
      animationEnd: 9,
      animationDelay: 120,
    }
    TurtleStates[TurtleState.Swimming] = {
      state: TurtleState.Swimming,
      manager: new SpriteManager("turtleSprite", "./public/img/Sprite-Tortue-Active-4x4-min.png", 1, 256, this.Scene),
      animationStart: 0,
      animationEnd: 14,
      animationDelay: 120,
    }
  }

  UpdateTurtleState(state: TurtleState): void {
    const newstate = TurtleStates[state];
    if (this.turtle) this.turtle.dispose();
    this.turtle = new Sprite("turtle", newstate.manager);
    this.turtle.playAnimation(newstate.animationStart, newstate.animationEnd, true, newstate.animationDelay);
    this.turtle.size = 4;

    this.turtle.position = this.MainMesh.position;
    this.turtleState = newstate;
  }
}

