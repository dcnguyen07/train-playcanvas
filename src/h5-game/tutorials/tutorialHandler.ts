/* eslint-disable no-negated-condition */

import * as pc from "playcanvas";
import { FocusTutorialActor, TutorialActionEvent } from "./forcusTutorialAction";
import { GameStorage } from "../../template/systems/storage/gameStorage";

export enum TutorialHandlerEvent {
  TutorialCompleted = "TutorialHandler:ActionCompleted",
}

export class TutorialHandler extends pc.EventHandler {
  type : string;
  actor : FocusTutorialActor | null;
  tutorialName : string | null;

  /**
   * @param {string} type the type of the tutorial
   * @param {FocusTutorialActor} actor the actor of the tutorial
  */
  constructor(type: string = "single", actor: FocusTutorialActor | null = null) {
    super();
    this.type = type;
    this.actor = actor;
  }

  /**
     * @param {string} tutorialName
     * @param {import("./tutorialManager").TutorialActionData[]} data
     */
  playTutorial(tutorialName: string, data: import("./tutorialManager").TutorialActionData[]) {
    if (this.actor) {
      this.actor.once(TutorialActionEvent.ActionCompleted, this.fire.bind(this, TutorialHandlerEvent.TutorialCompleted));
      this.tutorialName = tutorialName;
      this.actor.doAction(data);
    }
  }
}

export class SequenceTutorialHandler extends TutorialHandler {
  index : number;
  data : import("./tutorialManager").TutorialActionData[];
  delayBetweenActions : number;

  /**
    * @param {FocusTutorialActor} actor the actor of the tutorial
    */
  constructor(actor: FocusTutorialActor | null = null, { delayBetweenActions = 0.5 }: { delayBetweenActions?: number } = {}) {
    super("sequence", actor);
    this.index = 0;
    this.data = [];
    this.delayBetweenActions = delayBetweenActions;
  }

  /**
   * @param {string} tutorialName
     * @param {import("./tutorialManager").TutorialActionData[]} data
     */
  override playTutorial(tutorialName: string, data: import("./tutorialManager").TutorialActionData[]) : void {
    this.index = 0;
    while (this.isActionSaveInProgress(this.index)) {
      this.index++;
      if (this.index >= this.data.length) {
        this.fire(TutorialHandlerEvent.TutorialCompleted);
        return;
      }
    }
    this.data = data;
    this.tutorialName = tutorialName;
    this._onActionCompleted();
  }

  _onActionCompleted() : void {

    if (this.index >= this.data.length) {
      this.fire(TutorialHandlerEvent.TutorialCompleted);
      return;
    }

    // check last action is completed
    if (this.isActionSaveInProgress(this.data.length - 1)) {
      this.fire(TutorialHandlerEvent.TutorialCompleted);
      return;
    }

    while (this.isActionSaveInProgress(this.index)) {
      this.index++;
      if (this.index >= this.data.length) {
        this.fire(TutorialHandlerEvent.TutorialCompleted);
        return;
      }
    }

    setTimeout(() => {
      this.actor.once(TutorialActionEvent.ActionCompleted, this._onActionCompleted, this);
      this.actor.once(TutorialActionEvent.ActionCompleted, this._saveProgress.bind(this, this.index));
      this.actor.doAction(this.data[this.index]);
      this.index++;
    }, this.delayBetweenActions * 1000);
  }

  _saveProgress(index : number) : void {
    if (index >= this.data.length) {
      this.fire(TutorialHandlerEvent.TutorialCompleted);
      return;
    }

    if (this.data[index].saveProgress) {
      this._saveActionProgress(index);
    }
  }

  _saveActionProgress(index : number) : void {
    let actionStorageProgress : any = GameStorage.instance.getItem(this.tutorialName);
    if (!actionStorageProgress) {
      actionStorageProgress = {};
    }
    else {
      actionStorageProgress = JSON.parse(actionStorageProgress);
    }

    if (this.data[index].name) {
      actionStorageProgress[this.data[index].name] = true;
    }
    else {
      actionStorageProgress[index] = true;
    }
    GameStorage.instance.setItem(this.tutorialName, JSON.stringify(actionStorageProgress));
  }

  isActionSaveInProgress(index : number) : boolean {
    let actionStorageProgress : any = GameStorage.instance.getItem(this.tutorialName);
    if (!actionStorageProgress) {
      return false;
    }
    else {
      actionStorageProgress = JSON.parse(actionStorageProgress);
      let action  = this.data[index];
      if (action.name) {
        return actionStorageProgress[action.name] && action.saveProgress;
      }
      else {
        return actionStorageProgress[index] && action.saveProgress;
      }
    }
  }
}

