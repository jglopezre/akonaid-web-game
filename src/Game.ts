import { Application, Assets, Sprite } from "pixi.js";

export class Game {
  private app: Application;
  private container: HTMLElement;
  private bunny?: Sprite;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  // 1. Inicializar la aplicación PIXI
  async init(): Promise<void> {
    this.app = new Application();
    await this.app.init({
      background: "#1099bb",
      resizeTo: window,
    });
    this.container.appendChild(this.app.canvas);
  }

  // 2. Crear elementos del juego (assets, sprites, etc.)
  async create(): Promise<void> {
    const texture = await Assets.load("/assets/bunny.png");
    this.bunny = new Sprite(texture);
    this.bunny.anchor.set(0.5);
    this.bunny.position.set(
      this.app.screen.width / 2,
      this.app.screen.height / 2
    );
    this.app.stage.addChild(this.bunny);
  }

  // 3. Bucle de actualización (ticker)
  update(): void {
    this.app.ticker.add((time) => {
      if (this.bunny) {
        this.bunny.rotation += 0.01 * time.deltaTime;
      }
    });
  }

  async run() {
    await this.init();
    await this.create();
    this.update();
  }
}
