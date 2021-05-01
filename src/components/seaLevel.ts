import Level from '../level/level'
import { PhysicsImpostor, MeshBuilder, Vector3, StandardMaterial, Color3, Texture } from 'babylonjs';
import GameObject from './gameobject';

export default class SeaLevel extends GameObject {
  /**
   * 
   * @param level 
   */
  constructor(level: Level, altitude = 12) {
    super(level);
    //mesh
    const sea = MeshBuilder.CreateGround("sea", { width: 512, height: 512 }, this.Scene);
    //TODO : dynamic position ?
    sea.position = new Vector3(0, altitude, 250);
    sea.rotation = new Vector3(0, 0, Math.PI);
    const seaBox = MeshBuilder.CreateBox("seaBox", { width: 512, height: 4, depth: 512 }, this.Scene);
    seaBox.position = new Vector3(0, altitude - 1, 250);
    seaBox.visibility = 0;

    const water = new StandardMaterial("water", this.Scene);
    water.diffuseColor = new Color3(0.7, 0.8, 0.9);
    water.backFaceCulling = false;
    water.twoSidedLighting = true;
    const waterTexture = new Texture("./public/img/water.jpg", this.Scene);

    waterTexture.uScale = 5.0;
    waterTexture.vScale = 5.0;
    water.diffuseTexture = waterTexture;
    sea.material = water;

    //TODO : manager water animation

    //physic
    seaBox.physicsImpostor = new PhysicsImpostor(seaBox, PhysicsImpostor.BoxImpostor, {
      mass: 0,
      restitution: 1,
      friction: 0,

    });


    this.MainMesh = sea;
  }
}
