import { Texture } from 'babylonjs';

export default class AnimatedTexture extends Texture {
  private idx = 0;
  private cellSizeU: number
  private cellSizeV: number
  private hSpriteNb: number
  private vSpriteNb: number
  private get cellCount(): number { return this.hSpriteNb * this.vSpriteNb }
  /**
   *
   */
  constructor(url, level, options = { col: 1, row: 1 }, param = []) {
    super(url, level.scene, ...param);
    this.hSpriteNb = options.col;  // 6 sprites per raw : aka columns
    this.vSpriteNb = options.row;  // 4 sprite raws:  aka rows

    this.cellSizeU = 1 / this.hSpriteNb;
    this.cellSizeV = 1 / this.vSpriteNb;

    this.uScale = this.cellSizeU;
    this.vScale = this.cellSizeV;

    this.uOffset = 0;
    this.vOffset = 0.5;

    const comicTimer = setInterval(() => {
      this.Update();
    }, 140);
  }

  public setIndexTo(idx: number) {
    //if (idx >= this.cellCount || idx < 0) throw "index out of range";
    this.idx = idx;

    const u = (idx % this.hSpriteNb);
    const v = Math.floor(idx / this.hSpriteNb);
    this.uOffset = u * this.cellSizeU;
    this.vOffset = (v * this.cellSizeV) + ((this.vSpriteNb * this.cellSizeV) - this.cellSizeV);
  }

  Update() {
    if (this.idx < this.cellCount) this.setIndexTo(this.idx + 1);
    else this.setIndexTo(0);
  }
}
