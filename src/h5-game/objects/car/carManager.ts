import { Entity, Vec3 } from "playcanvas";
import { GameConstant } from "../../../gameConstant";
import { Util } from "../../../template/helpers/util";
import { Spawner } from "../../scripts/components/spawner";
import { Car } from "./car";
import { MoveToPath } from "./moveToPath";
import { TrainObstacle } from "./trainObstacle";

export class CarManager extends Entity {
  cars : Entity[] = [];
  carSpawner: Spawner<Car>;
  trainSpawner: Spawner<TrainObstacle>;

  constructor() {
    super("carManager");
    this._initSpawner();
  }

  _initSpawner() {
    let carEntity = new Entity();
    this.addChild(carEntity);
    this.carSpawner = carEntity.addScript(Spawner<Car>, {
      attributes: {
        class    : Car,
        poolSize : 2,
      },
    });

    let trainEntity = new Entity();
    this.addChild(trainEntity);
    this.trainSpawner = trainEntity.addScript(Spawner<TrainObstacle>, {
      attributes: {
        class    : TrainObstacle,
        poolSize : 2,
      },
    });

  }

  spawnCar(startPoint: Vec3, endPoint: Vec3, angle: Vec3) {
    let carSpawner = this.carSpawner.spawn();
    this.cars.push(carSpawner);
    if (carSpawner.isInitialized) {
      this.setPointsCarSpawner(carSpawner, startPoint, endPoint, angle);
    }
    else {
      carSpawner.once("loaded", () => {
        this.setPointsCarSpawner(carSpawner, startPoint, endPoint, angle);
      });
    }
  }

  spawnTrain(startPoint: Vec3, endPoint: Vec3, angle : Vec3) {
    let trainSpawner = this.trainSpawner.spawn();
    if (!trainSpawner) {
      return;
    }
    this.cars.push(trainSpawner);
    if (trainSpawner.isInitialized) {
      this.setPointsTrainSpawner(trainSpawner, startPoint, endPoint, angle);
    }
    else {
      trainSpawner.once("loaded", () => {
        this.setPointsTrainSpawner(trainSpawner, startPoint, endPoint, angle);
      });
    }
  }

  setPointsCarSpawner(carSpawner : any, startPoint : Vec3, endPoint : Vec3, angle: Vec3) {
    carSpawner.setLocalEulerAngles(angle.x, angle.y, angle.z);
    carSpawner.startPoint = startPoint;
    carSpawner.endPoint = endPoint;
    carSpawner.moveToPath.startPoint = startPoint;
    carSpawner.moveToPath.endPoint = endPoint;
    carSpawner.moveToPath.speed = GameConstant.SPEED_CAR_OBSTACLE;
    carSpawner.moveToPath.start();
    carSpawner.rigidbody.teleport(startPoint);
    let randomIndexCar = Util.randomInt(1, 3);
    carSpawner.changeModel(`model_car_obstacle_0${randomIndexCar}`);
    carSpawner.rigidbody.on("collisionstart", this._onCollisionStart.bind(this));
    carSpawner.rigidbody.on("triggerenter", this._onCollisionStart.bind(this));
    carSpawner.once(MoveToPath.Events.OnMoveToPathEnd, () => {
      carSpawner.moveToPath.stop();
      carSpawner.destroy();
    });
  }

  setPointsTrainSpawner(trainSpawner : any, startPoint : Vec3, endPoint : Vec3, angle :Vec3) {
    if (trainSpawner.rigidbody === undefined) {
      console.log("rigidbody is undefined");
      return;
    }
    trainSpawner.setLocalEulerAngles(angle.x, angle.y, angle.z);
    trainSpawner.startPoint = startPoint;
    trainSpawner.endPoint = endPoint;
    trainSpawner.moveToPath.startPoint = startPoint;
    trainSpawner.moveToPath.endPoint = endPoint;
    trainSpawner.moveToPath.speed = GameConstant.SPEED_TRAIN_OBSTACLE;
    trainSpawner.moveToPath.start();
    trainSpawner.rigidbody.teleport(startPoint);
    trainSpawner.once(MoveToPath.Events.OnMoveToPathEnd, () => {
      trainSpawner.fire(Spawner.Event.Despawn);
    });
    // trainSpawner.collision.on("collisionstart", this._onCollisionStart.bind(this));
    trainSpawner.rigidbody.on("collisionstart", this._onCollisionStart.bind(this));
    trainSpawner.rigidbody.on("triggerenter", this._onCollisionStart.bind(this));
  }

  _onCollisionStart(other: any) {
    if (other.name === "player") {
      this.fire(Car.Events.onCollide, other.other);
    }
  }

  public stopAllCarObstacle() {
    this.cars.forEach((car) => {
      // @ts-ignore
      car.moveToPath.speed = 0;
    });
  }

  public resetAllCarObstacle() {
    this.cars.forEach((car) => {
      car.destroy();
    });
    this.cars = [];
  }
}
