import Level from '../level/level'
import { Vector3, PhysicsImpostor, Mesh, SpriteManager, Sprite, KeyboardEventTypes, PointerEventTypes, TransformNode, Angle, Color3, Space, Quaternion } from 'babylonjs';
import GameObject from './gameobject';
import Helpers from '../helpers/helpers';

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
  //public turtleCameraTarget: TransformNode;

  //private readonly TARGETDISTANCE = 3;
  private readonly SPRITEOFFSET_Y = 0.5;

  constructor(level: Level, mesh?: Mesh) {
    super(level);

    if (mesh) {
      this.MainMesh = mesh;
    }
    else {
      throw "NOPE";
    }
    /*
    this.turtleCameraTarget = new TransformNode("turtleCameraTarget", this.Scene);
    this.turtleCameraTarget.position = new Vector3(this.MainMesh.position.x, this.MainMesh.position.y + this.TARGETDISTANCE, this.MainMesh.position.z)
    this.turtleCameraTarget.parent = this.MainMesh;
*/
    this.turtlePhysic = new PhysicsImpostor(this.MainMesh, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.1, friction: 0.2 }, this.Scene);
    this.MainMesh.physicsImpostor = this.turtlePhysic;
    //TODO : lock angularVelocity
    //this.turtlePhysic.setDeltaRotation(Quaternion.FromEulerAngles(1, 0, 0));
    this.turtlePhysic.afterStep = () => {
      this.turtlePhysic.setDeltaRotation(Quaternion.Zero());
    }

    this.LoadTurtleStates();
    this.UpdateTurtleState(TurtleState.Idle);


    //bind controls
    this.Scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type == KeyboardEventTypes.KEYDOWN) {
        switch (kbInfo.event.keyCode) {
          case 90://Z - UP
            console.log("pressed Z");
            //this.MainMesh.rotate(Vector3.Right(), -Math.PI / 8);
            this.MainMesh.rotatePOV(Math.PI / 2, 0, 0);
            break;
          case 81://Q - LEFT
            this.MainMesh.addRotation(0, -Math.PI / 8, 0);
            break;
          case 83://S - DOWN
            this.MainMesh.addRotation(Math.PI / 8, 0, 0);
            break;
          case 68://D - RIGHT
            this.MainMesh.addRotation(0, Math.PI / 8, 0);
            break;
          //spaceBar
          case 32:
            console.log("pressed spacebar");

            this.MainMesh.physicsImpostor.applyImpulse(new Vector3(this.MainMesh.forward.x, this.MainMesh.forward.y, this.MainMesh.forward.z), this.MainMesh.getAbsolutePosition());
            break;
        }
      }
    });

    this.Scene.onPointerObservable.add((mouseData) => {
      if (mouseData.type == PointerEventTypes.POINTERMOVE) {

        //HACK : offsetX and Y are still experimentals /!\ check browser compatibility
        console.log(`Δ ${mouseData.event.movementX}:${-mouseData.event.movementY} @ pos ${mouseData.event.offsetX}:${mouseData.event.offsetY}`);
        const MouseVector = new Vector3(mouseData.event.movementX, -mouseData.event.movementY, 1);
        MouseVector.normalize();
        //Vector3.RotationFromAxis(this.MainMesh.forward,)
        //const OrientVector = Vector3.Lerp(Vector3.Forward(), MouseVector, 1);
        console.log(`orient ${MouseVector.x}:${MouseVector.y}:${MouseVector.z}`);

        //if (line) line.dispose();
        //line = Helpers.DrawVector(this.Scene, MouseVector, 7, this.MainMesh.getAbsolutePosition());
        //this.MainMesh.setDirection(MouseVector);

        //yeah !
        //lerp between current ForwardVector and MouseVector, then apply rotation
        //this.MainMesh.rotatePOV()
        //this.MainMesh.addRotation(MouseVector.x * 0.1, MouseVector.y * 0.1, MouseVector.z * 0.1);
        //this.MainMesh.rotate(MouseVector, 0.5);
        //TODO : extract rotation speed factor
        //this.MainMesh.addRotation(mouseData.event.movementY / 300, 0, 0).addRotation(0, mouseData.event.movementX / 300, 0);
        this.MainMesh.rotate(Vector3.Right(), mouseData.event.movementY / 300);
        this.MainMesh.rotate(Vector3.Up(), mouseData.event.movementX / 300, Space.WORLD);
      }
    });

    let forwardLine;
    this.Env.registerFunctionBeforeUpdate(() => {
      this.turtle.position = new Vector3(this.MainMesh.position.x, this.MainMesh.position.y + this.SPRITEOFFSET_Y, this.MainMesh.position.z);
      //HACK : clamp speed
      this.turtlePhysic.setLinearVelocity(Vector3.Clamp(this.turtlePhysic.getLinearVelocity(), this.Env.CONFIG.MIN_VELOCITY_VECTOR, this.Env.CONFIG.MAX_VELOCITY_VECTOR));

      if (forwardLine) forwardLine.dispose();
      forwardLine = Helpers.DrawVector(this.Scene, this.MainMesh.forward, 7, this.MainMesh.getAbsolutePosition(), Color3.Purple());
      //slerp ?
      //TODO : not working => check before apply rotation !!!
      const limitValue = 0.4;
      if (this.MainMesh.rotationQuaternion.x > limitValue) this.MainMesh.rotationQuaternion.x = limitValue;
      if (this.MainMesh.rotationQuaternion.x < -limitValue) this.MainMesh.rotationQuaternion.x = -limitValue;

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
  /*// Parameters: name, position, scene
  var camera = new BABYLON.FlyCamera("FlyCamera", new BABYLON.Vector3(0, 5, -10), scene);
  
  // Airplane like rotation, with faster roll correction and banked-turns.
  // Default is 100. A higher number means slower correction.
  camera.rollCorrect = 10;
  // Default is false.
  camera.bankedTurn = true;
  // Defaults to 90° in radians in how far banking will roll the camera.
  camera.bankedTurnLimit = Math.PI / 2;
  // How much of the Yawing (turning) will affect the Rolling (banked-turn.)
  // Less than 1 will reduce the Rolling, and more than 1 will increase it.
  camera.bankedTurnMultiplier = 1;
  
  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);*/
}

