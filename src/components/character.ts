import Level from '../level/level'
import { Vector3, PhysicsImpostor, Mesh, SpriteManager, Sprite, KeyboardEventTypes } from 'babylonjs';
import GameObject from './gameobject';

//TODO : should use the 
export default class Character extends GameObject {
  public turtle: Sprite;
  public turtlePhysic: PhysicsImpostor;
  private readonly SPRITEOFFSET_Y = 1;

  constructor(level: Level, mesh?: Mesh) {
    super(level);

    if (mesh) {
      this.MainMesh = mesh;
    }
    else {
      throw "NOPE";
    }

    this.turtlePhysic = new PhysicsImpostor(this.MainMesh, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.1, friction: 0.2 }, this.Scene);
    this.MainMesh.physicsImpostor = this.turtlePhysic;

    const spriteManagerFlare = new SpriteManager("turtleSprite", "./public/img/turtle-4x4.png", 1, 256, this.Scene);
    this.turtle = new Sprite("turtle", spriteManagerFlare);
    this.turtle.playAnimation(0, 3, true, 120);
    this.turtle.size = 4;
    this.turtle.position = this.MainMesh.position;

    //bind controls
    this.Scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type == KeyboardEventTypes.KEYDOWN) {
        switch (kbInfo.event.keyCode) {
          //spaceBar
          case 32:
            console.log("pressed spacebar");
            this.MainMesh.physicsImpostor.applyImpulse(new Vector3(0, 0, 0.1), this.MainMesh.getAbsolutePosition());
            break;
        }
      }
    });

    this.Env.registerFunctionBeforeUpdate(() => {
      this.turtle.position = new Vector3(this.MainMesh.position.x, this.MainMesh.position.y + this.SPRITEOFFSET_Y, this.MainMesh.position.z);
      //hack : clamp speed
      this.turtlePhysic.setLinearVelocity(Vector3.Clamp(this.turtlePhysic.getLinearVelocity(), Vector3.Zero(), this.Env.CONFIG.MAX_VELOCITY_VECTOR));
    });

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

