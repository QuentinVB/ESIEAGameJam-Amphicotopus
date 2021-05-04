import { Texture, DynamicTexture } from 'babylonjs';
import Level from '../level/level';

interface ILayer {
  picture: HTMLImageElement,
  isAnimated: boolean,
  coordinates?: {
    sx: number,
    sy: number,
    sw: number,
    sh: number,
  }
}

export default class MultiLayerAnimatedTexture extends DynamicTexture {
  private idx = 0;
  private cellSizeU: number
  private cellSizeV: number
  private hSpriteNb: number
  private vSpriteNb: number
  private width: number
  private height: number
  animationTimer: number;
  private get cellCount(): number { return this.hSpriteNb * this.vSpriteNb }
  private animatedU: number;
  private animatedV: number;
  private Layers: ILayer[] = [];
  /**
   *
   */
  constructor(name: string, level: Level, options = { width: 256, height: 256 }, params = []) {
    super(name, { width: options.width, height: options.height }, level.scene, true, ...params);
    this.width = options.width;
    this.height = options.height;
    //todo : register all the image to dispose !!
    this.onDisposeObservable.add(() => { clearInterval(this.animationTimer); })
    this.wrapU = DynamicTexture.WRAP_ADDRESSMODE;
    this.wrapV = DynamicTexture.WRAP_ADDRESSMODE;
  }

  public AddBackgroundTexture(path: string, options = { width: 256, height: 256 }): void {
    const img = new Image(options.width, options.height);
    img.src = path;
    img.onload = () => {
      this.Layers.push({ picture: img, isAnimated: false });
      this.Redraw();
    }
  }

  public AddAnimationTexture(path: string, options = { width: 256, height: 256, col: 1, row: 1 }): void {
    this.hSpriteNb = options.col;  // 6 sprites per raw : aka columns
    this.vSpriteNb = options.row;  // 4 sprite raws:  aka rows

    this.cellSizeU = Math.floor(options.width / this.hSpriteNb);
    this.cellSizeV = Math.floor(options.height / this.vSpriteNb);
    this.animatedU = 0;
    this.animatedV = 0;

    const img = new Image(options.width, options.height);
    img.src = path;
    img.onload = () => {
      this.Layers.push({ picture: img, isAnimated: true });
      //this.Redraw();

      this.animationTimer = setInterval(() => {
        this.Redraw();
        this.UpdateAnimation();
      }, 140);
    }

  }
  //TODO : on dispose remove timer !

  private UpdateAnimation() {
    if (this.idx < this.cellCount - 1) this.setIndexTo(this.idx + 1);
    else this.setIndexTo(0);
  }

  public setIndexTo(idx: number) {
    //if (idx >= this.cellCount || idx < 0) throw "index out of range";
    this.idx = idx;

    const u = (idx % this.hSpriteNb);
    const v = Math.floor(idx / this.hSpriteNb);
    this.animatedU = u * this.cellSizeU;
    this.animatedV = v * this.cellSizeV;
    //this.vOffset = (v * this.cellSizeV) + ((this.vSpriteNb * this.cellSizeV) - this.cellSizeV);
  }

  public Redraw(): void {
    const ctx = this.getContext();
    this.Layers.forEach(element => {
      if (!element.isAnimated) {
        ctx.drawImage(element.picture, 0, 0);
      }
      else {
        ctx.drawImage(element.picture, this.animatedU, this.animatedV, this.cellSizeU, this.cellSizeV, 0, 0, this.width, this.height);
      }
    });
    this.update();
  }
}

