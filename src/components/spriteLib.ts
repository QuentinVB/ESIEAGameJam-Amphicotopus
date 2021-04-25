import { SpriteManager, Scene } from "babylonjs";

export interface ISpriteInfo {
  manager: SpriteManager,
  animationStart: number,
  animationEnd: number,
  animationDelay: number,
  size: number,
}
interface ISpriteLibrary {
  [key: string]: ISpriteInfo
}
let scene: Scene;

export class SpriteLibrary implements ISpriteLibrary {
  constructor(currentScene: Scene) {
    scene = currentScene;
  }

  [key: string]: ISpriteInfo;

  ["Bag"] = {
    manager: new SpriteManager("bagSpriteManager", "./public/img/Sprite-Sac-3x3-min.png", 100, 128, scene),
    animationStart: 0,
    animationEnd: 7,
    animationDelay: 240,
    size: 1
  };
  ["Medusa"] = {
    manager: new SpriteManager("meduseSpriteManager", "./public/img/Sprite-Meduse-3x3-min.png", 100, 128, scene),
    animationStart: 0,
    animationEnd: 7,
    animationDelay: 240,
    size: 1
  };
  ["PinkCoral"] = {
    manager: new SpriteManager("pinkCoralSpriteManager", "./public/img/Sprite-PinkCoral-4x4-min.png", 100, 128, scene),
    animationStart: 0,
    animationEnd: 13,
    animationDelay: 200,
    size: 4
  };
}
