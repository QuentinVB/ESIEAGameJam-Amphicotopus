import { Texture } from 'babylonjs';

export default class AnimatedTexture extends Texture {
  private hSpriteNb: number
  private vSpriteNb: number
  /**
   *
   */
  constructor(url, scene, param) {
    super(url, scene, ...param);
    this.hSpriteNb = 6;  // 6 sprites per raw
    this.vSpriteNb = 4;  // 4 sprite raws

    /*
    var faceUV = new Array(6);
    
    for (var i = 0; i < 6; i++) {
      faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }
  
    //faceUV[1] = new BABYLON.Vector4(0, 0, 1 / hSpriteNb, 1 / vSpriteNb);  
    */
  }

  Update() {
    this.uOffset += 1 / 6;
  }
}

