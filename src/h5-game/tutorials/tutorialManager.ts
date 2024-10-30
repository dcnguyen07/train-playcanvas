/* eslint-disable no-negated-condition */
import * as pc from "playcanvas";
import { FocusTutorialActor, TrackScreenElementTutorialActor } from "./forcusTutorialAction";
import {
  ActiveScreenConditionComparator,
  CompletedTutorialConditionComparator,
  DailyChallengeConditionComparator,
  LocalStorageArrayConditionComparator,
  LocalStorageConditionComparator,
  LocalStorageObjectConditionComparator,
  TutorialConditionComparator,
} from "./tutorialConditionComparator";
import FocusTutorial from "./focusTutorial";
import { SequenceTutorialHandler, TutorialHandler, TutorialHandlerEvent } from "./tutorialHandler";
import { AssetManager } from "../../template/assetManager";
import { GameStorage } from "../../template/systems/storage/gameStorage";
import { GameConstant } from "../../gameConstant";
import { waitToNFrames } from "../../template/helpers/util";

/* eslint-disable default-case */
/**
 * @enum {string}
 * @property {string} EQUALS
 * @property {string} GREATER_THAN
 * @property {string} EQUALS_OR_GREATER_THAN
 */
export enum ComparisonOperator {
  EQUAL = "=",
  GREATER_THAN = ">",
  GREATER_THAN_OR_EQUAL = ">=",
  LESS_THAN = "<",
  LESS_THAN_OR_EQUAL = "<=",
  NOT_EQUAL = "!=",
}

export interface TutorialCondition {
  type: string;
  name: string;
  key: string;
  value: number;
  operator: ComparisonOperator;

}

export interface TutorialActionData {
  type: string;
  name: string;
  layerName?: string;
  screen?: string;
  element?: string;
  text?: string;
  message?: any;
  focus?: any;
  hand?: any;
  saveProgress?: boolean;
  blockInput?: boolean;

}

export interface TutorialData {
  type: string;
  name: string;
  actions: TutorialActionData[];
  unlockConditions: TutorialCondition[];
}

enum TutorialManagerEvent {
  TutorialCompleted = "TutorialManager:TutorialCompleted",
}

export default class TutorialManager extends pc.EventHandler {

  private static _instance: TutorialManager | null = null;

  private uiManager: import("../../template/ui/uiManager").UIManager;
  private tutorials: TutorialData[];
  private comparator: { [key: string]: TutorialConditionComparator };
  private actors: { [key: string]: FocusTutorialActor };
  private handlers: { [key: string]: TutorialHandler };
  public showingTutorial: TutorialData | null;

  /**
   * @returns {TutorialManager}
   * @readonly
   */
  public static get instance(): TutorialManager {
    return TutorialManager._instance;
  }

  /**
   * @param { import("../../template/ui/uiManager").UIManager} uiManager
   */
  constructor(uiManager: import("../../template/ui/uiManager").UIManager) {
    super();
    TutorialManager._instance = this;
    this.uiManager = uiManager;
    /**
     * @type {TutorialData[]}
     * @private
     */
    this.tutorials = AssetManager.find("tutorial_data.json").resources;

    /**
     * @type {Object<string, TutorialConditionComparator>}
     */
    this.comparator = {
      localStorage       : new LocalStorageConditionComparator(),
      tutorialCompleted  : new CompletedTutorialConditionComparator(),
      localStorageArray  : new LocalStorageArrayConditionComparator(),
      localStorageObject : new LocalStorageObjectConditionComparator(),
      dailyChallenge     : new DailyChallengeConditionComparator(),
      activeScreen       : new ActiveScreenConditionComparator(this.uiManager),
    };

    /**
     * @type {Object<string, FocusTutorialActor>}
     */
    this.actors = {
      trackScreenElement: new TrackScreenElementTutorialActor(uiManager),
    };

    /**
     * @type {Object<string, TutorialHandler>}
     */
    this.handlers = {
      single   : new TutorialHandler("single", this.actors.trackScreenElement),
      sequence : new SequenceTutorialHandler(this.actors.trackScreenElement, { delayBetweenActions: 0 }),
    };
  }

  checkTutorial(): void {
    let isDetected = false;
    this.tutorials.forEach((tutorial) => {
      if (isDetected) {
        return;
      }
      if (this._checkUnlockCondition(tutorial) && !this.isTutorialCompleted(tutorial.name)) {
        this._playTutorial(tutorial);
        isDetected = true;
        return;
      }
    });
  }

  _checkUnlockCondition(tutorial: TutorialData): boolean {
    return tutorial.unlockConditions.every((condition) => this._checkCondition(condition));
  }

  /**
   * @param {TutorialCondition} condition
   * @returns {boolean} True if the condition is met, false otherwise
   */
  _checkCondition(condition: TutorialCondition): boolean {
    let comparator = this.comparator[condition.type];
    if (!comparator) {
      console.warn(`Comparator ${condition.type} not found!`);
      return false;
    }
    return comparator.checkCondition(condition);
  }

  playTutorial(tutorialName: string): void {
    let tutorial = this.tutorials.find((tut) => tut.name === tutorialName);
    if (!tutorial) {
      console.warn(`Tutorial ${tutorialName} not found!`);
      return;
    }
    this._playTutorial(tutorial);
  }

  /**
   * @param {TutorialData} tutorial
   */
  _playTutorial(tutorial: TutorialData): void {
    let handler = this.handlers[tutorial.type];
    if (!handler) {
      console.warn(`Tutorial handler ${tutorial.type} not found!`);
      return;
    }

    this.showingTutorial = tutorial;
    handler.once(TutorialHandlerEvent.TutorialCompleted, this._completeTutorial.bind(this, tutorial));
    handler.playTutorial(tutorial.name, tutorial.actions);
  }

  completeTutorial() {
    this.tutorials.forEach((tutorial) => {
      if (this._checkUnlockCondition(tutorial)) {
        this._completeTutorial(tutorial);
      }
    });
  }

  /**
   * @param {TutorialData} tutorial
   */
  _completeTutorial(tutorial: TutorialData): void {
    let completedTutorials: string[] = [];
    let completedTutorialsString = GameStorage.instance.getItem(GameConstant.STORAGE_COMPLETED_TUTORIALS);


    if (completedTutorialsString) {
      try {
        completedTutorials = JSON.parse(completedTutorialsString);
      }
      catch (error) {
        console.error("Error parsing completed tutorials from storage:", error);
      }
    }

    completedTutorials.push(tutorial.name);
    GameStorage.instance.setItem(GameConstant.STORAGE_COMPLETED_TUTORIALS, JSON.stringify(completedTutorials));
    this.showingTutorial = null;
    waitToNFrames()
      .then(() => {
        this.fire(TutorialManagerEvent.TutorialCompleted, tutorial.name);
      });
  }

  isTutorialCompleted(tutorialName: string): boolean {
    let completedTutorials = GameStorage.instance.getItem(GameConstant.STORAGE_COMPLETED_TUTORIALS);
    if (!completedTutorials) {
      return false;
    }
    completedTutorials = JSON.parse(completedTutorials);
    return completedTutorials.includes(tutorialName);
  }

  completeCurrentTutorial(): void {
    if (this.showingTutorial) {
      FocusTutorial.instance.hide();
      this._completeTutorial(this.showingTutorial);
    }
  }

  getActiveTutorial(): TutorialData | null {
    return this.showingTutorial;
  }
}
