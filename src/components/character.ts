import Level from '../level/level'
import { Vector3, PhysicsImpostor, Mesh, SpriteManager, Sprite, KeyboardEventTypes, AbstractMesh, ActionManager } from 'babylonjs';
import { KEYS } from '../common';
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
  private readonly SPRITEOFFSET_Y = 0.5;
  private readonly BASESPEED = 0.3;
  private readonly MOVEMENTSPEED = 0.5;

  private readonly MAXINCLINAISONANGLEAMPLITUDE = Math.PI / 4;
  private readonly TURNFORCE = 0.08;
  private readonly COOLDOWNRESET = 10;
  private readonly EPSILON = 0.01;
  private turnCooldown = this.COOLDOWNRESET;
  private turtleAngleValue = 0;

  constructor(level: Level, mesh?: Mesh) {
    super(level);

    if (mesh) {
      this.MainMesh = mesh;
      this.MainMesh.isVisible = level.env.CONFIG.DEBUG;
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
      this.turtlePhysic.applyImpulse(Vector3.Forward().scale(this.BASESPEED), this.MainMesh.getAbsolutePosition());
    });
    this.LoadTurtleStates();
    this.UpdateTurtleState(TurtleState.Idle);

    //--COLLISIONS--
    this.MainMesh.actionManager = new ActionManager(this.Scene);

    //bind controls
    this.Scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type == KeyboardEventTypes.KEYDOWN) {
        switch (kbInfo.event.keyCode) {
          case KEYS.UP://UP
            this.turtlePhysic.applyImpulse(Vector3.Up().scale(this.MOVEMENTSPEED), this.MainMesh.getAbsolutePosition())
            break;
          case KEYS.LEFT://Q - LEFT
            this.turtlePhysic.applyImpulse(Vector3.Left().scale(this.MOVEMENTSPEED), this.MainMesh.getAbsolutePosition());
            this.turnCooldown = this.COOLDOWNRESET;
            this.turtleAngleValue += this.TURNFORCE;
            break;
          case KEYS.DOWN://S - DOWN
            this.turtlePhysic.applyImpulse(Vector3.Down().scale(this.MOVEMENTSPEED), this.MainMesh.getAbsolutePosition())
            break;
          case KEYS.RIGHT://D - RIGHT
            this.turtlePhysic.applyImpulse(Vector3.Right().scale(this.MOVEMENTSPEED), this.MainMesh.getAbsolutePosition())
            this.turnCooldown = this.COOLDOWNRESET;
            this.turtleAngleValue -= this.TURNFORCE;
            break;
          //spaceBar
          case 32:
            //new Vector3(this.MainMesh.forward.x, this.MainMesh.forward.y, this.MainMesh.forward.z)
            this.turtlePhysic.applyImpulse(Vector3.Forward().scale(this.Env.CONFIG.SPEED), this.MainMesh.getAbsolutePosition());
            break;
        }
      }
    });
    /*
    this.Scene.onPointerObservable.add((mouseData) => {
      if (mouseData.type == PointerEventTypes.POINTERMOVE) {
        //HACK : offsetX and Y are still experimentals /!\ check browser compatibility
        //console.log(`?? ${mouseData.event.movementX}:${-mouseData.event.movementY} @ pos ${mouseData.event.offsetX}:${mouseData.event.offsetY}`);
        const MouseVector = new Vector3(mouseData.event.movementX * this.MOVEMENTSPEED, -mouseData.event.movementY * this.MOVEMENTSPEED, this.BASESPEED);
        //TODO : if position close to 0 : reduce vertical speed (lerp around max and min)
        this.turtlePhysic.applyImpulse(MouseVector, this.MainMesh.getAbsolutePosition());
        //TODO : use mouse vector to animate orientation
        //Vector2.Lerp()

      }
    });
*/
    //let forwardLine;
    this.Env.registerFunctionBeforeUpdate(() => {
      //update sprite position
      this.turtle.position = new Vector3(this.MainMesh.position.x, this.MainMesh.position.y + this.SPRITEOFFSET_Y, this.MainMesh.position.z);
      //HACK : clamp speed
      this.turtlePhysic.setLinearVelocity(Vector3.Clamp(this.turtlePhysic.getLinearVelocity(), this.Env.CONFIG.MIN_VELOCITY_VECTOR, this.Env.CONFIG.MAX_VELOCITY_VECTOR));
      //if (forwardLine) forwardLine.dispose();
      //forwardLine = Helpers.DrawVector(this.Scene, this.MainMesh.forward, 7, this.MainMesh.getAbsolutePosition(), Color3.Purple());
      this.turtleAngleUpdater();

      //TODO : countdown, when done and no button pressed, reset
      if (this.turtlePhysic.getLinearVelocity().length() > 0.1 && this.turtleState.state == TurtleState.Idle) {
        this.UpdateTurtleState(TurtleState.Swimming);
      }
      else if (this.turtlePhysic.getLinearVelocity().length() < 0.1 && this.turtleState.state == TurtleState.Swimming) {
        this.UpdateTurtleState(TurtleState.Idle);
      }
    });


  }
  turtleAngleUpdater(): void {
    //this.Level.env.engine.getDeltaTime();
    //if an turn is in progress substract cooldown

    if (Math.abs(this.turtleAngleValue) != 0) {
      this.turnCooldown--;
      //apply damping force if cooldown expired
      if (this.turnCooldown < 0) {
        this.turtleAngleValue += (-Math.sign(this.turtleAngleValue) * this.TURNFORCE * 0.5);
      }
    }
    //reset turn if below epsilon
    if (Math.abs(this.turtleAngleValue) < this.EPSILON) {
      this.turtleAngleValue = 0;
      const lv = this.turtlePhysic.getLinearVelocity();
      this.turtlePhysic.setLinearVelocity(new Vector3(0, lv.y, lv.z));
      this.turnCooldown = this.COOLDOWNRESET;
    }
    //clamp turn factor and compute in the amplitude
    this.turtleAngleValue = Math.max(Math.min(this.turtleAngleValue, 1), -1);
    this.turtle.angle = (this.turtleAngleValue) * (this.MAXINCLINAISONANGLEAMPLITUDE) / 2;
    console.log(this.turtleAngleValue);
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

