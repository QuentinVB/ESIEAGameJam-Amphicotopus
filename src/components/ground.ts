import Level from '../level/level'
import { PhysicsImpostor, MeshBuilder, Mesh, Vector4, StandardMaterial, Texture, Color3, Vector3 } from 'babylonjs';
import GameObject from './gameobject';
import { MultiLayerAnimatedTexture, AnimatedTexture } from './index';

export default class Ground extends GameObject {
  //, parameters: unknown
  /**
   *
   */
  constructor(level: Level, mesh?: Mesh) {
    super(level);


    //mesh
    const options = {
      sideOrientation: Mesh.DOUBLESIDE,
      pattern: Mesh.NO_FLIP,
      width: 5,
      height: 5,
      tileSize: 1,
      tileWidth: 1
    }
    let ground: Mesh;
    if (mesh) {
      ground = mesh;
    }
    else {
      ground = MeshBuilder.CreateTiledPlane('ground', options, this.Level.scene);
      ground.rotation = new Vector3(Math.PI / 2, 0, 0);
    }

    if (!ground.isAnInstance) {
      //todo : merge existing mat (if any)

      const mat = new StandardMaterial("mat1", this.Level.scene);
      mat.alpha = 1.0;
      mat.ambientColor = new Color3(0.1, 1.0, 1.0);
      ground.material = mat;


      //const mat = this.Scene.getMaterialByName("Sand");

      //tileNumber.png
      //const texture = new Texture("./public/img/sand.png", this.Level.scene);

      //const texture = new AnimatedTexture("./public/img/caustics_atlas.png", this.Level, { col: 4, row: 4 });
      const texture = new MultiLayerAnimatedTexture("multiLayer", this.Level, { width: 256, height: 256 });
      texture.AddBackgroundTexture("./public/img/sand.png", { width: 256, height: 256 });
      texture.AddAnimationTexture("./public/img/caustics_atlas.png", { width: 1024, height: 1024, col: 4, row: 4 });
      //texture.AddAnimationTexture("./public/img/tileNumber.png", { width: 256, height: 256, col: 2, row: 2 });
      texture.uScale = 1;
      texture.vScale = 2;
      mat.diffuseTexture = texture;

    }
    //physic
    ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, {
      mass: 0,
      restitution: 0.1,
      friction: 0.1
    });
    this.MainMesh = ground;
  }
}
